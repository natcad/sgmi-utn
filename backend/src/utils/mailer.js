import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendConfirmationMail = async (email, token) => {
  const confirmacionUrl = `${process.env.FRONTEND_URL}/confirmar?token=${token}`;
  await transporter.sendMail({
    from: `"SGMI UTN" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Confirma tu cuenta",
    html: `<h3>Bienvenido a SGMI UTN</h3>
        <p>Por favor, confirma tu cuenta haciendo clic en el siguiente enlace: <a href="${confirmacionUrl}">Confirmar Cuenta</a></p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        `,
  });
};

export const sendResetPasswordMail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"SGMI UTN" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Resetear Contraseña",
    html: `<h3>Solicitud de Reseteo de Contraseña</h3>
        <p>Haz clic en el siguiente enlace para resetear tu contraseña: <a href="${resetUrl}">Resetear Contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        `,
  });
};