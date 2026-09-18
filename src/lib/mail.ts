import nodemailer from 'nodemailer';

export interface SendWelcomeEmailParams {
  to: string;
  name: string;
  plan: 'monthly' | 'yearly';
  amount: number;
  expiresAt: Date;
  invoiceId?: string;
}

export async function sendWelcomeSubscriptionEmail(params: SendWelcomeEmailParams) {
  const { to, name, plan, amount, expiresAt, invoiceId } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 465;
  const from = process.env.SMTP_FROM || 'BrokerSpace <no-reply@brokerspace.com>';

  const formattedExpiry = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
  }).format(expiresAt);

  const planName = plan === 'yearly' ? 'Annual Membership' : 'Monthly Membership';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Welcome to BrokerSpace</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 32px; text-align: center; color: #ffffff; }
          .content { padding: 32px; }
          .receipt-box { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .receipt-total { border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 12px; font-weight: bold; font-size: 16px; }
          .button { display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: bold; margin-top: 20px; }
          .footer { padding: 24px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Welcome to BrokerSpace!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 15px;">Your verified broker membership is active</p>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for subscribing to <strong>BrokerSpace</strong>! Your account has been verified and your subscription has been officially activated.</p>
            
            <div class="receipt-box">
              <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 12px;">Invoice & Subscription Summary</div>
              <div class="receipt-row">
                <span>Plan:</span>
                <strong>${planName}</strong>
              </div>
              <div class="receipt-row">
                <span>Billing Period:</span>
                <span>Active until ${formattedExpiry}</span>
              </div>
              ${invoiceId ? `
              <div class="receipt-row">
                <span>Reference Invoice:</span>
                <span>${invoiceId}</span>
              </div>
              ` : ''}
              <div class="receipt-row receipt-total">
                <span>Amount Paid:</span>
                <span style="color: #0d9488;">₱${amount.toLocaleString('en-PH')}</span>
              </div>
            </div>

            <h3 style="margin-top: 28px; font-size: 16px;">What you can do next:</h3>
            <ul style="padding-left: 20px; color: #334155; line-height: 1.6;">
              <li><strong>Share Off-Market Listings:</strong> Post properties visible only to verified brokers.</li>
              <li><strong>Connect & Co-Broke:</strong> Chat and negotiate deals directly with colleagues.</li>
              <li><strong>Track Performance:</strong> Monitor views and analytics on your listings in real-time.</li>
            </ul>

            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="${appUrl}/feed" class="button">Access Your BrokerSpace Dashboard &rarr;</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BrokerSpace. All rights reserved.</p>
            <p>If you have any billing or account questions, reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Fallback if SMTP is not configured in development
  if (!host || !user || !pass) {
    console.log('----------------------------------------------------');
    console.log(`[Email Simulation] Welcome email dispatched to: ${to}`);
    console.log(`Plan: ${planName} | Amount: ₱${amount} | Expires: ${formattedExpiry}`);
    console.log('----------------------------------------------------');
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Welcome to BrokerSpace - Your ${planName} is Active! (Invoice Receipt)`,
      html: htmlContent,
    });

    console.log(`[Email] Welcome email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    // Do not throw so payment processing is not blocked if email has temporary network issue
    return { success: false, error };
  }
}
