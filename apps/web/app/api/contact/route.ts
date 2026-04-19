import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { CreateEmailOptions, CreateEmailResponseSuccess } from "resend";
import type { Attribution, AttributionTouch } from "@/lib/attribution";
import { captureServerEvent } from "@/lib/posthog-server";
import { isServiceSlug, type ServiceSlug } from "@/lib/services";

export const runtime = "nodejs";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const isProd =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production";

type SimulatedEmailResponse = {
  id: string;
  simulated: true;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

interface ContactFormPayload {
  name: string;
  email: string;
  company?: string;
  service: ServiceSlug;
  message: string;
  attribution?: Attribution;
}

const isContactFormPayload = (value: unknown): value is ContactFormPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { name, email, company, service, message } = value as Record<
    string,
    unknown
  >;

  return (
    typeof name === "string" &&
    typeof email === "string" &&
    (company === undefined || typeof company === "string") &&
    isServiceSlug(service) &&
    typeof message === "string"
  );
};

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "referrer",
  "landing_path",
  "landing_timestamp",
] as const;

const normalizeTouch = (value: unknown): AttributionTouch | null => {
  if (typeof value !== "object" || value === null) return null;
  const source = value as Record<string, unknown>;
  const touch: AttributionTouch = {};
  for (const key of ATTRIBUTION_KEYS) {
    const raw = source[key];
    if (typeof raw === "string" && raw.length > 0 && raw.length < 500) {
      touch[key] = raw;
    }
  }
  return Object.keys(touch).length > 0 ? touch : null;
};

const normalizeAttribution = (value: unknown): Attribution => {
  if (typeof value !== "object" || value === null) {
    return { first: null, last: null };
  }
  const source = value as Record<string, unknown>;
  return {
    first: normalizeTouch(source.first),
    last: normalizeTouch(source.last),
  };
};

const attributionRow = (label: string, value?: string): string =>
  value
    ? `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
    : "";

const renderAttributionSection = (
  attribution: Attribution,
  serverSignals: {
    userAgent?: string;
    country?: string;
    city?: string;
    ip?: string;
  }
): string => {
  const last = attribution.last ?? {};
  const first = attribution.first ?? {};

  const rows = [
    attributionRow("Fonte", last.utm_source),
    attributionRow("Meio", last.utm_medium),
    attributionRow("Campanha", last.utm_campaign),
    attributionRow("Termo", last.utm_term),
    attributionRow("Conteúdo", last.utm_content),
    attributionRow("Google Click ID", last.gclid),
    attributionRow("Facebook Click ID", last.fbclid),
    attributionRow("Microsoft Click ID", last.msclkid),
    attributionRow("Página de chegada", last.landing_path),
    attributionRow("Referrer", last.referrer),
    attributionRow(
      "Localização",
      [serverSignals.city, serverSignals.country].filter(Boolean).join(", ") ||
        undefined
    ),
    attributionRow("User-Agent", serverSignals.userAgent),
    attributionRow("Primeira visita", first.landing_timestamp),
    attributionRow("Primeira fonte", first.utm_source),
    attributionRow("Primeira campanha", first.utm_campaign),
  ]
    .filter(Boolean)
    .join("");

  if (!rows) return "";

  return `
    <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 20px;">
      <h3 style="margin-top: 0; color: #374151;">Atribuição</h3>
      ${rows}
    </div>
  `;
};

const simulateSend = (payload: CreateEmailOptions): SimulatedEmailResponse => {
  console.info(
    "[contact] Simulated email send:",
    JSON.stringify(payload, null, 2)
  );

  return {
    id: "simulated-email",
    simulated: true,
  };
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Check Resend configuration in production
  if (!resend && isProd) {
    console.error("RESEND_API_KEY is missing in production environment");
    return NextResponse.json(
      {
        error: "Configuracao de e-mail ausente. Tente novamente mais tarde.",
      },
      { status: 500, headers }
    );
  }

  try {
    // Parse request body
    const body = (await request.json()) as unknown;

    if (!isContactFormPayload(body)) {
      return NextResponse.json(
        {
          error: "Dados de contato invalidos",
        },
        { status: 400, headers }
      );
    }

    const { name, email, company, service, message, attribution } = body;
    const normalizedAttribution = normalizeAttribution(attribution);

    const serverSignals = {
      userAgent: request.headers.get("user-agent") ?? undefined,
      country: request.headers.get("x-vercel-ip-country") ?? undefined,
      city: (() => {
        const raw = request.headers.get("x-vercel-ip-city");
        if (!raw) return undefined;
        try {
          return decodeURIComponent(raw);
        } catch {
          return raw;
        }
      })(),
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        undefined,
    };

    // Validate required fields
    if (!name || !email || !service || !message) {
      return NextResponse.json(
        {
          error: "Todos os campos são obrigatórios",
        },
        { status: 400, headers }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "E-mail inválido",
        },
        { status: 400, headers }
      );
    }

    // Normalize inputs server-side (defense in depth; client also trims)
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompany = company?.trim() ?? "";
    const trimmedMessage = message.trim();

    // Email configuration — fall back to safe defaults only in dev/simulation
    const fromEmailEnv = process.env.FROM_EMAIL;
    const toEmailEnv = process.env.TO_EMAIL;
    if (isProd && (!fromEmailEnv || !toEmailEnv)) {
      console.error("[contact] Missing FROM_EMAIL/TO_EMAIL in production", {
        hasFrom: !!fromEmailEnv,
        hasTo: !!toEmailEnv,
      });
      return NextResponse.json(
        {
          error: "Configuracao de e-mail ausente. Tente novamente mais tarde.",
        },
        { status: 500, headers }
      );
    }
    const fromEmail = fromEmailEnv || "onboarding@resend.dev";
    const toEmail = toEmailEnv || "contato@moklabs.com.br";
    const fromName = process.env.FROM_NAME || "Mok Labs";

    const noCompanyBanner = trimmedCompany
      ? ""
      : `<div style="background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-weight: 600;">&#9888;&#65039; Lead sem empresa/editora informada &mdash; triagem recomendada antes de responder.</div>`;

    const emailPayload: CreateEmailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      subject: `[${service}] Novo contato de ${trimmedName}`,
      replyTo: [trimmedEmail],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0013ff;">Novo contato via site</h2>
          ${noCompanyBanner}

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${escapeHtml(trimmedName)}</p>
            <p><strong>E-mail:</strong> ${escapeHtml(trimmedEmail)}</p>
            ${
              trimmedCompany
                ? `<p><strong>Empresa/Editora:</strong> ${escapeHtml(trimmedCompany)}</p>`
                : ""
            }
            <p><strong>Serviço de interesse:</strong> ${escapeHtml(service)}</p>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${escapeHtml(
              trimmedMessage
            ).replace(/\n/g, "<br>")}</p>
          </div>

          ${renderAttributionSection(normalizedAttribution, serverSignals)}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">

          <p style="font-size: 14px; color: #6b7280;">
            Esta mensagem foi enviada através do formulário de contato do site Mok Labs.
          </p>
        </div>
      `,
    };

    let result: CreateEmailResponseSuccess | SimulatedEmailResponse;

    if (!resend) {
      result = simulateSend(emailPayload);
    } else {
      const { data, error } = await resend.emails.send(emailPayload, {
        idempotencyKey: randomUUID(),
      });

      if (error || !data) {
        console.error("[contact] Resend send failed", {
          name: error?.name,
          message: error?.message,
          from: emailPayload.from,
          to: emailPayload.to,
          subject: emailPayload.subject,
        });
        return NextResponse.json(
          {
            error:
              "Erro ao enviar e-mail. Verifique a configuracao do remetente em Resend.",
          },
          { status: 500, headers }
        );
      }

      console.info("[contact] Resend send succeeded", {
        id: data.id,
        to: emailPayload.to,
      });
      result = data;
    }

    // Server-side PostHog capture bypasses ad-blockers so the conversion
    // count stays close to what Google Ads reports even when clients block
    // posthog-js. Fire-and-await so Vercel doesn't kill us mid-flush.
    const flatTouch = normalizedAttribution.last ?? {};
    await captureServerEvent({
      distinctId: trimmedEmail,
      event: "lead_submitted_server",
      properties: {
        service,
        company: trimmedCompany || undefined,
        has_company: trimmedCompany.length > 0,
        country: serverSignals.country,
        city: serverSignals.city,
        ...flatTouch,
        ...(normalizedAttribution.first
          ? Object.fromEntries(
              Object.entries(normalizedAttribution.first).map(([k, v]) => [
                `first_${k}`,
                v,
              ])
            )
          : {}),
      },
    });

    return NextResponse.json(
      {
        message: resend
          ? "Mensagem enviada com sucesso!"
          : "Mensagem recebida (modo teste).",
        data: result,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("[contact] Unhandled server error", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
      },
      { status: 500, headers }
    );
  }
}
