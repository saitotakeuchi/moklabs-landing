import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { CreateEmailOptions, CreateEmailResponseSuccess } from "resend";

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

const SERVICE_OPTIONS = [
  "Conversão EPUB3",
  "Recursos Digitais",
  "Simuladores",
  "Objetos Digitais",
  "Livro Digital",
  "PNLD Digital",
  "Audiodescrição",
  "Ilustração",
] as const;

type ServiceOption = (typeof SERVICE_OPTIONS)[number];

interface ContactFormPayload {
  name: string;
  email: string;
  company?: string;
  service: ServiceOption;
  message: string;
}

const isServiceOption = (value: unknown): value is ServiceOption =>
  typeof value === "string" &&
  (SERVICE_OPTIONS as readonly string[]).includes(value);

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
    isServiceOption(service) &&
    typeof message === "string"
  );
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

    const { name, email, company, service, message } = body;

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

    // Validate message length
    if (message.trim().length < 10) {
      return NextResponse.json(
        {
          error: "Mensagem deve ter pelo menos 10 caracteres",
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

    const emailPayload: CreateEmailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      subject: `[${service}] Novo contato de ${trimmedName}`,
      replyTo: [trimmedEmail],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0013ff;">Novo contato via site</h2>

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
