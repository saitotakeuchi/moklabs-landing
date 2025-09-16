import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'E-mail inválido'
      });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Mok Labs <contato@moklabs.com.br>',
      to: ['contato@moklabs.com.br'],
      subject: `Novo contato de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Novo contato via site</h2>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">

          <p style="font-size: 14px; color: #6b7280;">
            Esta mensagem foi enviada através do formulário de contato do site Mok Labs.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        error: 'Erro ao enviar e-mail. Tente novamente.'
      });
    }

    // Send auto-reply to the user
    await resend.emails.send({
      from: 'Mok Labs <contato@moklabs.com.br>',
      to: [email],
      subject: 'Recebemos sua mensagem - Mok Labs',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Obrigado pelo contato, ${name}!</h2>

          <p style="line-height: 1.6; color: #4b5563;">
            Recebemos sua mensagem e entraremos em contato em breve.
          </p>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Sua mensagem:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Entre em contato direto:</h3>
            <p><strong>WhatsApp:</strong> +55 (41) 99999-9999</p>
            <p><strong>E-mail:</strong> contato@moklabs.com.br</p>
            <p><strong>Instagram:</strong> @moklabs</p>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            Atenciosamente,<br>
            Equipe Mok Labs
          </p>
        </div>
      `,
    });

    res.status(200).json({
      message: 'Mensagem enviada com sucesso!',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});