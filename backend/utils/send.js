// backend/utils/sendEmail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function send ({ to, subject, text, html }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Falta RESEND_API_KEY en variables de entorno");
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    // para que tu controller muestre algo útil en logs
    throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
  }
}

module.exports = send;
