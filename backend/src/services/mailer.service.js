import nodemailer from "nodemailer";
// src/services/mailer.service.js
/**
 * MailerService
 * Enviar mails (con adjuntos) para SGMI.
 *
 * Uso:
 *  await MailerService.send({
 *    to: ["admin@x.com"],
 *    subject: "Memoria 2026 - Grupo X",
 *    html: "<p>Adjuntamos la memoria.</p>",
 *    attachments: [{ filename, content: buffer, contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }]
 *  })
 */

const getBool = (v) => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase().trim();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return undefined;
};

const requiredEnv = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Falta variable de entorno ${key}`);
  return val;
};

let transporter;

/**
 * Inicializa el transporter una sola vez (lazy).
 * Si cambia config en runtime, reiniciá el proceso.
 */
function getTransporter() {
  if (transporter) return transporter;

  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");

  const secureEnv = getBool(process.env.SMTP_SECURE);
  const secure = secureEnv ?? port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Sanitiza lista de destinatarios.
 */
function normalizeRecipients(to) {
  const list = Array.isArray(to) ? to : [to];
  const clean = list
    .flat()
    .map((s) => String(s ?? "").trim())
    .filter(Boolean);

  // quitar duplicados
  return [...new Set(clean)];
}

export const MailerService = {
  /**
   * Enviar email
   * @param {Object} params
   * @param {string|string[]} params.to
   * @param {string|string[]} [params.cc]
   * @param {string|string[]} [params.bcc]
   * @param {string} params.subject
   * @param {string} [params.html]
   * @param {string} [params.text]
   * @param {Array}  [params.attachments] nodemailer attachments
   * @param {Object} [params.headers] headers extras
   */
  async send({
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    attachments = [],
    headers = {},
  }) {
    const from = process.env.MAIL_FROM || requiredEnv("SMTP_USER");

    const toList = normalizeRecipients(to);
    const ccList = cc ? normalizeRecipients(cc) : undefined;
    const bccList = bcc ? normalizeRecipients(bcc) : undefined;

    if (!toList.length) throw new Error("No hay destinatarios (to) para enviar email");
    if (!subject) throw new Error("Falta subject para enviar email");
    if (!html && !text) throw new Error("Falta body (html o text) para enviar email");

    const tx = getTransporter();

    // Opcional: verifica conexión (si querés, lo podés comentar para performance)
    // await tx.verify();

    const info = await tx.sendMail({
      from,
      to: toList.join(", "),
      cc: ccList?.join(", "),
      bcc: bccList?.join(", "),
      subject,
      html,
      text,
      attachments,
      headers,
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    };
  },

  /**
   * Helper específico: enviar memoria (excel/pdf) a admins/evaluadores.
   * @param {Object} params
   * @param {string[]} params.to
   * @param {Object} params.memoria  (para armar subject y body)
   * @param {Array} params.attachments
   */
  async sendMemoria({ to, memoria, attachments }) {
    const grupoNombre = memoria?.grupo?.nombre ?? `Grupo #${memoria?.grupoId ?? ""}`;
    const anio = memoria?.anio ?? "";
    const version = memoria?.version ?? "";
    const estado = memoria?.estado ?? "";

    const subject = `Memoria ${anio} - ${grupoNombre} (v${version})`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;">
        <p>Se recibió una memoria para revisión.</p>
        <ul>
          <li><b>Grupo:</b> ${grupoNombre}</li>
          <li><b>Año:</b> ${anio}</li>
          <li><b>Versión:</b> ${version}</li>
          <li><b>Estado:</b> ${estado}</li>
        </ul>
        <p>Se adjunta el archivo para su evaluación.</p>
      </div>
    `;

    return this.send({ to, subject, html, attachments });
  },
};
