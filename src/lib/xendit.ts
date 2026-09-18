/**
 * Xendit Payment Gateway Client
 * Works in both Test Mode (Sandbox) and Live Mode based on XENDIT_SECRET_KEY
 */

export interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  customerName: string;
  customerPhone?: string;
  plan: 'monthly' | 'yearly';
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'SETTLED';
  merchant_name: string;
  merchant_profile_picture_url?: string;
  amount: number;
  payer_email: string;
  description: string;
  invoice_url: string;
  expiry_date: string;
}

const XENDIT_API_URL = 'https://api.xendit.co/v2/invoices';

export async function createXenditInvoice(params: CreateInvoiceParams): Promise<XenditInvoiceResponse> {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // If secret key is not set, provide a development simulation fallback
  if (!secretKey || secretKey.startsWith('xnd_development_placeholder') || secretKey === 'your_xendit_secret_key') {
    console.warn('[Xendit] XENDIT_SECRET_KEY is not configured with a valid key. Using local sandbox mock.');
    return {
      id: `mock_inv_${Date.now()}`,
      external_id: params.externalId,
      user_id: 'mock_user',
      status: 'PENDING',
      merchant_name: 'BrokerSpace (Sandbox Mock)',
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      invoice_url: `${appUrl}/payment/mock-checkout?external_id=${encodeURIComponent(params.externalId)}&amount=${params.amount}&plan=${params.plan}&email=${encodeURIComponent(params.payerEmail)}`,
      expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');

  const payload = {
    external_id: params.externalId,
    amount: params.amount,
    currency: 'PHP',
    payer_email: params.payerEmail,
    description: params.description,
    customer: {
      given_names: params.customerName,
      email: params.payerEmail,
      mobile_number: params.customerPhone || undefined,
    },
    customer_notification_preference: {
      invoice_created: ['email'],
      invoice_reminder: ['email'],
      invoice_paid: ['email'],
    },
    success_redirect_url: `${appUrl}/payment/success?external_id=${encodeURIComponent(params.externalId)}`,
    failure_redirect_url: `${appUrl}/payment/pending?external_id=${encodeURIComponent(params.externalId)}`,
    invoice_duration: 86400, // 24 hours
  };

  const response = await fetch(XENDIT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Xendit] Failed to create invoice:', response.status, errorText);
    throw new Error(`Xendit API error: ${response.statusText} (${errorText})`);
  }

  return await response.json();
}

/**
 * Validates incoming webhook callback token from Xendit
 */
export function verifyXenditCallbackToken(providedToken: string | null): boolean {
  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expectedToken) {
    console.warn('[Xendit Webhook] XENDIT_CALLBACK_TOKEN is not set. Webhook token check skipped in development.');
    return true;
  }
  return providedToken === expectedToken;
}

/**
 * Retrieves invoice status directly from Xendit API by ID or external_id
 */
export async function getXenditInvoice(idOrExternalId: string): Promise<XenditInvoiceResponse | null> {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey || secretKey.startsWith('xnd_development_placeholder') || secretKey === 'your_xendit_secret_key') {
    return null;
  }

  const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');
  const isExternalId = idOrExternalId.startsWith('sub_');
  const url = isExternalId
    ? `${XENDIT_API_URL}?external_id=${encodeURIComponent(idOrExternalId)}`
    : `${XENDIT_API_URL}/${encodeURIComponent(idOrExternalId)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (Array.isArray(data)) {
      return data[0] || null;
    }
    return data;
  } catch (error) {
    console.error('[Xendit] Error querying invoice:', error);
    return null;
  }
}
