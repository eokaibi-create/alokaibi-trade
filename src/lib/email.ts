import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.SMTP_USER || "eokaibi@gmail.com";
  const pass = process.env.SMTP_PASS || "";
  if (!pass) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const t = getTransporter();
  if (!t) return { sent: false, reason: "SMTP not configured" };
  try {
    await t.sendMail({
      from: `"ALOKAIBI INT TRADE" <${process.env.SMTP_USER || "eokaibi@gmail.com"}>`,
      to, subject, text,
      html: html || text.replace(/\n/g, "<br>"),
    });
    return { sent: true };
  } catch (err: any) {
    return { sent: false, reason: err.message };
  }
}

export async function sendInquiryNotification(inquiry: { name: string; email: string; phone?: string; company?: string; category?: string; product_name?: string; quantity?: string; message: string }) {
  const text = `New Inquiry\n━━━━━━━━━━━━\nFrom: ${inquiry.name}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || "—"}\nCompany: ${inquiry.company || "—"}\nCategory: ${inquiry.category || "—"}\nProduct: ${inquiry.product_name || "—"}\nQuantity: ${inquiry.quantity || "—"}\n\nMessage:\n${inquiry.message}\n\n━━━━━━━━━━━━\nView: https://okaibi-website.vercel.app/admin/inquiries`;
  return sendEmail(process.env.NOTIFICATION_EMAIL || "eokaibi@gmail.com", `📩 New Inquiry from ${inquiry.name}`, text);
}

export async function sendContactNotification(contact: { name: string; email: string; subject?: string; message: string }) {
  const text = `New Contact Message\n━━━━━━━━━━━━\nFrom: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject || "—"}\n\nMessage:\n${contact.message}`;
  return sendEmail(process.env.NOTIFICATION_EMAIL || "eokaibi@gmail.com", `📬 New Message from ${contact.name}`, text);
}

export async function sendReplyNotification(name: string, email: string, replyText: string) {
  const text = `Dear ${name},\n\nThank you for your inquiry. Here is our response:\n\n${replyText}\n\n━━━━━━━━━━━━\nBest regards,\nALOKAIBI INT TRADE\nEmail: eokaibi@gmail.com\nWhatsApp: +601123093400`;
  return sendEmail(email, "💬 Re: Your Inquiry to ALOKAIBI INT TRADE", text);
}
