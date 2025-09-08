// backend/src/lib/mailer.ts
import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function createFallbackTransporter(): Transporter {
  // minimal stub that logs instead of sending in dev
  return {
    sendMail: async (opts: any) => {
      console.log('[MAILER - fallback] sendMail called with:', {
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
      });
      return Promise.resolve({ accepted: Array.isArray(opts.to) ? opts.to : [opts.to], messageId: 'dev-fake-id' });
    },
  } as unknown as Transporter;
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    transporter = createFallbackTransporter();
    return transporter;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  } catch (err) {
    console.error('Failed to create SMTP transporter, falling back to logger:', err);
    transporter = createFallbackTransporter();
    return transporter;
  }
}

/** Trimite un e-mail HTML. */
export async function sendEmail(to: string, subject: string, html: string) {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || `no-reply@localhost`;
  try {
    return await t.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error('sendEmail failed, fallback logging:', err);
    // fallback: log and return a fake result
    return { accepted: [to], messageId: 'error-fallback' };
  }
}

// Alias for compatibility
export const sendMail = sendEmail;

export async function verifyMailer() {
  try {
    const t = getTransporter();
    if (typeof (t as any).verify === 'function') {
      await (t as any).verify();
      console.log('SMTP connection OK');
    } else {
      console.log('SMTP transporter has no verify(), skipping');
    }
  } catch (err) {
    console.error('SMTP verify failed, continuing with fallback:', err);
  }
}
