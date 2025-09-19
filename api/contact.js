import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const parseJsonBody = async (req) => {
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch (error) {
        console.error("Failed to parse string body:", error);
        return {};
      }
    }

    return req.body;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString();

  try {
    return rawBody ? JSON.parse(rawBody) : {};
  } catch (error) {
    console.error("Failed to parse streamed body:", error);
    return {};
  }
};

const sendStatus = (res, statusCode) => {
  if (typeof res.status === "function") {
    return res.status(statusCode).end();
  }

  res.statusCode = statusCode;
  res.end();
};

const sendJson = (res, statusCode, payload) => {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const simulateSend = (payload) => {
  console.info("[contact] Simulated email send:", JSON.stringify(payload, null, 2));

  return {
    id: "simulated-email",
    simulated: true,
  };
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return sendStatus(res, 200);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return sendJson(res, 405, {
      error: "Método não permitido",
    });
  }

  try {
    const { name, email, message } = await parseJsonBody(req);

    if (!name || !email || !message) {
      return sendJson(res, 400, {
        error: "Todos os campos são obrigatórios",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendJson(res, 400, {
        error: "E-mail inválido",
      });
    }

    if (message.trim().length < 10) {
      return sendJson(res, 400, {
        error: "Mensagem deve ter pelo menos 10 caracteres",
      });
    }

    const fromEmail = process.env.FROM_EMAIL || "contato@moklabs.com.br";
    const toEmail = process.env.TO_EMAIL || "contato@moklabs.com.br";

    const emailPayload = {
      from: `Mok Labs <${fromEmail}>`,
      to: [toEmail],
      subject: `Novo contato de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0013ff;">Novo contato via site</h2>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, "<br>")}</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">

          <p style="font-size: 14px; color: #6b7280;">
            Esta mensagem foi enviada através do formulário de contato do site Mok Labs.
          </p>
        </div>
      `,
    };

    let result;

    if (!resend) {
      result = simulateSend(emailPayload);
    } else {
      const { data, error } = await resend.emails.send(emailPayload);

      if (error) {
        console.error("Resend error:", error);
        return sendJson(res, 500, {
          error: "Erro ao enviar e-mail. Tente novamente.",
        });
      }

      result = data;
    }

    return sendJson(res, 200, {
      message: resend ? "Mensagem enviada com sucesso!" : "Mensagem recebida (modo teste).",
      data: result,
    });
  } catch (error) {
    console.error("Server error:", error);
    return sendJson(res, 500, {
      error: "Erro interno do servidor",
    });
  }
}
