/**
 * Email service using nodemailer.
 *
 * Reads SMTP config from environment variables. If SMTP is not configured
 * the helper gracefully falls back to logging the email to the console —
 * useful during local development.
 */

import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────
// SMTP transport
// ─────────────────────────────────────────────────────────────

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null; // SMTP not configured — will fall back to console
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const FROM =
  process.env.SMTP_FROM || "ChatBot <noreply@chatbot.app>";

/**
 * Build a modern-looking HTML email for the password-reset flow.
 */
function buildResetEmailHTML(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🔐 Password Reset</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.6;">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;
                              font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.5;">
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
                This link will expire in <strong>1 hour</strong>.
              </p>
              <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
              <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;">
                If the button doesn't work, copy this URL into your browser:<br />
                <a href="${resetUrl}" style="color:#6366f1;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;background:#f9fafb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} ChatBot &mdash; Your AI Assistant
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Send a password-reset email.
 *
 * @param to        - Recipient email address
 * @param resetToken - The raw hex token (used to build the reset URL)
 * @param resetUrl  - Full URL the user should visit to reset their password
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  resetUrl: string
): Promise<void> {
  const transport = createTransport();

  const mailOptions = {
    from: FROM,
    to,
    subject: "Reset Your Password — ChatBot",
    text: `You requested a password reset.\n\nClick here to reset your password: ${resetUrl}\n\nToken: ${resetToken}\n\nIf you did not request this, please ignore this email.\nThis link expires in 1 hour.`,
    html: buildResetEmailHTML(resetUrl),
  };

  if (!transport) {
    console.warn("⚠️  SMTP not configured — logging email to console:");
    console.log("─── Email ───────────────────────────────────────");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("─────────────────────────────────────────────────");
    return;
  }

  await transport.sendMail(mailOptions);
}
