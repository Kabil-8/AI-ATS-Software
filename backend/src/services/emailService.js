const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #F6F8FC; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(91,79,207,0.08); }
    .header { background: linear-gradient(135deg, #5B4FCF, #7B6FFF); padding: 32px 40px; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; color: #0B0D15; }
    .body p { font-size: 16px; line-height: 1.6; color: #3E4150; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin: 16px 0; }
    .btn { display: inline-block; background: #5B4FCF; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 24px 0; }
    .footer { background: #F6F8FC; padding: 24px 40px; border-top: 1px solid #E2E6EE; text-align: center; color: #6B6F80; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ATS Pro</h1>
      <p>AI-Powered Recruitment Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>This email was sent by ATS Pro. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const STATUS_CONFIG = {
  screening: {
    badge: 'background: #EDE9FE; color: #5B4FCF',
    label: '🔍 Under Review',
    message: "Great news! Your application is being reviewed by our recruitment team. We'll keep you updated.",
  },
  interview: {
    badge: 'background: #D1FAE5; color: #059669',
    label: '📅 Interview Scheduled',
    message: "Congratulations! You've been shortlisted for an interview. Our team will reach out with details shortly.",
  },
  offered: {
    badge: 'background: #FEF3C7; color: #D97706',
    label: '🎉 Offer Extended',
    message: "Fantastic news! We're excited to extend you an offer. Please check your email for further details.",
  },
  hired: {
    badge: 'background: #D1FAE5; color: #047857',
    label: '✅ Welcome Aboard!',
    message: "You've officially joined the team! We're thrilled to have you and will be in touch with onboarding details.",
  },
  rejected: {
    badge: 'background: #FEE2E2; color: #DC2626',
    label: '📋 Application Update',
    message: "Thank you for your interest. After careful consideration, we've decided to move forward with other candidates. We encourage you to apply for future openings.",
  },
};

const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (error) {
    console.error('[Email Error]', error.message);
  }
};

exports.sendApplicationConfirmation = async (user, job) => {
  const content = `
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Your application for <strong>${job.title}</strong> at <strong>${job.company || 'our company'}</strong> has been received successfully.</p>
    <span class="badge" style="background: #EDE9FE; color: #5B4FCF">✓ Application Received</span>
    <p>Our AI engine is now analyzing your resume against the job requirements. You'll receive updates as your application progresses through the pipeline.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View Application Status</a>
  `;
  await sendEmail(user.email, `Application Received — ${job.title}`, baseTemplate(content));
};

exports.sendStatusUpdate = async (applicant, job, newStatus, note) => {
  const config = STATUS_CONFIG[newStatus];
  if (!config || !applicant?.email) return;

  const content = `
    <p>Hi <strong>${applicant.name}</strong>,</p>
    <p>There's an update on your application for <strong>${job.title}</strong>:</p>
    <span class="badge" style="${config.badge}">${config.label}</span>
    <p>${config.message}</p>
    ${note ? `<p style="background:#F6F8FC; padding:16px; border-radius:12px; border-left:4px solid #5B4FCF;"><em>"${note}"</em></p>` : ''}
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View My Applications</a>
  `;
  await sendEmail(applicant.email, `Application Update — ${job.title}`, baseTemplate(content));
};
