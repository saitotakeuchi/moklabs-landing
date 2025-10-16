import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { CreateEmailOptions, CreateEmailResponseSuccess } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const isProd =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production";

type SimulatedEmailResponse = {
  id: string;
  simulated: true;
};

interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
}

const isContactFormPayload = (value: unknown): value is ContactFormPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { name, email, message } = value as Record<string, unknown>;

  return (
    typeof name === "string" &&
    typeof email === "string" &&
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

    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
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

    // Email configuration
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.TO_EMAIL || "contato@moklabs.com.br";
    const fromName = process.env.FROM_NAME || "Mok Labs";

    const emailPayload: CreateEmailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      subject: `Novo contato de ${name}`,
      replyTo: [email],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0013ff;">Novo contato via site</h2>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message.replace(
              /\n/g,
              "<br>"
            )}</p>
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
      const { data, error } = await resend.emails.send(emailPayload);

      if (error || !data) {
        console.error("Resend error:", error);
        return NextResponse.json(
          {
            error:
              "Erro ao enviar e-mail. Verifique a configuracao do remetente em Resend.",
          },
          { status: 500, headers }
        );
      }

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
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
      },
      { status: 500, headers }
    );
  }
}
