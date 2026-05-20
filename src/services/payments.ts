/**
 * Payment Service
 * Handles Stripe (Cards, Apple Pay, Google Pay), PayPal, Flutterwave (MTN, Airtel, Bank)
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const FLUTTERWAVE_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe() {
  if (!stripePromise && STRIPE_KEY) {
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise;
}

export type PaymentMethod =
  | 'card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'mtn_money'
  | 'airtel_money'
  | 'bank_transfer'
  | 'cash_on_delivery';

export interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  message: string;
  redirectUrl?: string;
}

// ============================================
// STRIPE - Cards, Apple Pay, Google Pay
// ============================================

export async function payWithStripe(request: PaymentRequest): Promise<PaymentResult> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env');
    }

    // Use Stripe Checkout redirect
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || ''}/api/payments/create-checkout`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: request.items,
          currency: request.currency,
          customerEmail: request.customerEmail,
          orderId: request.orderId,
          successUrl: `${window.location.origin}/checkout?status=success&orderId=${request.orderId}`,
          cancelUrl: `${window.location.origin}/checkout?status=cancelled&orderId=${request.orderId}`,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        await savePaymentRecord(request, 'stripe', 'pending');
        window.location.href = data.url;
        return { success: true, status: 'pending', message: 'Redirecting to Stripe...' };
      }
    }

    // Fallback: save as pending for manual processing
    await savePaymentRecord(request, 'stripe', 'pending');
    return {
      success: true,
      status: 'pending',
      message: 'Payment recorded. Admin will verify.',
    };
  } catch (err: any) {
    // Fallback: Save as pending payment for manual processing
    return await savePendingPayment(request, 'stripe', err.message);
  }
}

// ============================================
// PAYPAL
// ============================================

export async function payWithPayPal(request: PaymentRequest): Promise<PaymentResult> {
  try {
    if (!PAYPAL_CLIENT_ID) {
      return await savePendingPayment(request, 'paypal', 'PayPal not configured yet');
    }

    // PayPal redirect checkout
    const params = new URLSearchParams({
      cmd: '_xclick',
      business: import.meta.env.VITE_COMPANY_EMAIL || 'support@ahmadcostimetics.com',
      item_name: `Order ${request.orderId}`,
      amount: request.amount.toFixed(2),
      currency_code: request.currency,
      return: `${window.location.origin}/checkout?status=success&orderId=${request.orderId}&method=paypal`,
      cancel_return: `${window.location.origin}/checkout?status=cancelled&orderId=${request.orderId}`,
      notify_url: `${import.meta.env.VITE_API_URL || ''}/api/payments/paypal-ipn`,
      custom: request.orderId,
      email: request.customerEmail,
    });

    const paypalUrl = PAYPAL_CLIENT_ID.startsWith('sb-') || import.meta.env.DEV
      ? `https://www.sandbox.paypal.com/cgi-bin/webscr?${params}`
      : `https://www.paypal.com/cgi-bin/webscr?${params}`;

    // Save payment record before redirecting
    await savePaymentRecord(request, 'paypal', 'pending');

    window.location.href = paypalUrl;

    return {
      success: true,
      status: 'pending',
      message: 'Redirecting to PayPal...',
      redirectUrl: paypalUrl,
    };
  } catch (err: any) {
    return await savePendingPayment(request, 'paypal', err.message);
  }
}

// ============================================
// APPLE PAY (via Stripe)
// ============================================

export async function payWithApplePay(request: PaymentRequest): Promise<PaymentResult> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      return await savePendingPayment(request, 'apple_pay', 'Stripe not configured');
    }

    // Check if Apple Pay is available
    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: request.currency.toLowerCase(),
      total: {
        label: `Ahmad Costimetics - Order`,
        amount: Math.round(request.amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment?.applePay) {
      return {
        success: false,
        status: 'failed',
        message: 'Apple Pay is not available on this device. Please use another payment method.',
      };
    }

    // Apple Pay is available, use Stripe checkout with wallet
    return await payWithStripe({ ...request, method: 'apple_pay' });
  } catch (err: any) {
    return await savePendingPayment(request, 'apple_pay', err.message);
  }
}

// ============================================
// GOOGLE PAY (via Stripe)
// ============================================

export async function payWithGooglePay(request: PaymentRequest): Promise<PaymentResult> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      return await savePendingPayment(request, 'google_pay', 'Stripe not configured');
    }

    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: request.currency.toLowerCase(),
      total: {
        label: `Ahmad Costimetics - Order`,
        amount: Math.round(request.amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment?.googlePay) {
      return {
        success: false,
        status: 'failed',
        message: 'Google Pay is not available on this device. Please use another payment method.',
      };
    }

    return await payWithStripe({ ...request, method: 'google_pay' });
  } catch (err: any) {
    return await savePendingPayment(request, 'google_pay', err.message);
  }
}

// ============================================
// FLUTTERWAVE - MTN Money, Airtel Money, Bank Transfer
// ============================================

export async function payWithFlutterwave(
  request: PaymentRequest,
  subMethod: 'mtn_money' | 'airtel_money' | 'bank_transfer'
): Promise<PaymentResult> {
  try {
    if (!FLUTTERWAVE_KEY) {
      return await savePendingPayment(request, subMethod, 'Flutterwave not configured yet');
    }

    // Load Flutterwave inline script
    await loadFlutterwaveScript();

    return new Promise((resolve) => {
      const config: any = {
        public_key: FLUTTERWAVE_KEY,
        tx_ref: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount: request.amount,
        currency: request.currency === 'USD' ? 'NGN' : request.currency,
        payment_options: subMethod === 'mtn_money' ? 'mobilemoney' 
          : subMethod === 'airtel_money' ? 'mobilemoney' 
          : 'banktransfer',
        customer: {
          email: request.customerEmail,
          phone_number: request.customerPhone || '',
          name: request.customerName,
        },
        customizations: {
          title: 'Ahmad Costimetics',
          description: `Payment for Order ${request.orderId}`,
          logo: `${window.location.origin}/favicon.png`,
        },
        meta: {
          orderId: request.orderId,
          method: subMethod,
        },
        callback: async (response: any) => {
          if (response.status === 'successful' || response.status === 'completed') {
            await savePaymentRecord(request, subMethod, 'completed', response.transaction_id?.toString());
            resolve({
              success: true,
              transactionId: response.transaction_id?.toString(),
              reference: response.tx_ref,
              status: 'completed',
              message: 'Payment successful!',
            });
          } else {
            resolve({
              success: false,
              status: 'failed',
              message: 'Payment was not completed',
            });
          }
          // Close Flutterwave modal
          (window as any).FlutterwaveCheckout?.close?.();
        },
        onclose: () => {
          resolve({
            success: false,
            status: 'cancelled',
            message: 'Payment cancelled',
          });
        },
      };

      (window as any).FlutterwaveCheckout(config);
    });
  } catch (err: any) {
    return await savePendingPayment(request, subMethod, err.message);
  }
}

function loadFlutterwaveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).FlutterwaveCheckout) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Flutterwave'));
    document.head.appendChild(script);
  });
}

// ============================================
// BANK TRANSFER (Manual)
// ============================================

export async function payWithBankTransfer(request: PaymentRequest): Promise<PaymentResult> {
  // If Flutterwave is configured, use it for automated bank transfer
  if (FLUTTERWAVE_KEY) {
    return payWithFlutterwave(request, 'bank_transfer');
  }

  // Otherwise save as pending for manual verification
  await savePaymentRecord(request, 'bank_transfer', 'pending');

  return {
    success: true,
    status: 'pending',
    reference: `BT-${Date.now()}`,
    message: 'Bank transfer instructions sent. Please complete the transfer and upload your receipt.',
  };
}

// ============================================
// CASH ON DELIVERY
// ============================================

export async function payWithCashOnDelivery(request: PaymentRequest): Promise<PaymentResult> {
  await savePaymentRecord(request, 'cash_on_delivery', 'pending');

  return {
    success: true,
    status: 'pending',
    reference: `COD-${Date.now()}`,
    message: 'Order placed! Payment will be collected on delivery.',
  };
}

// ============================================
// HELPERS
// ============================================

async function savePaymentRecord(
  request: PaymentRequest,
  method: string,
  status: string,
  transactionId?: string
) {
  try {
    await addDoc(collection(db, 'payments'), {
      orderId: request.orderId,
      method,
      amount: request.amount,
      currency: request.currency,
      status,
      transactionId: transactionId || null,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save payment record:', error);
  }
}

async function savePendingPayment(
  request: PaymentRequest,
  method: string,
  errorMessage: string
): Promise<PaymentResult> {
  // Save a pending payment so admin can verify manually
  await savePaymentRecord(request, method, 'pending');

  return {
    success: true,
    status: 'pending',
    reference: `PND-${Date.now()}`,
    message: `Payment recorded as pending. ${errorMessage ? `Note: ${errorMessage}` : ''} Admin will verify your payment.`,
  };
}

// ============================================
// MAIN PAYMENT PROCESSOR
// ============================================

export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  switch (request.method) {
    case 'card':
      return payWithStripe(request);
    case 'paypal':
      return payWithPayPal(request);
    case 'apple_pay':
      return payWithApplePay(request);
    case 'google_pay':
      return payWithGooglePay(request);
    case 'mtn_money':
      return payWithFlutterwave(request, 'mtn_money');
    case 'airtel_money':
      return payWithFlutterwave(request, 'airtel_money');
    case 'bank_transfer':
      return payWithBankTransfer(request);
    case 'cash_on_delivery':
      return payWithCashOnDelivery(request);
    default:
      return {
        success: false,
        status: 'failed',
        message: `Unsupported payment method: ${request.method}`,
      };
  }
}

// Payment method availability check
export const PAYMENT_METHODS = {
  card: { available: !!STRIPE_KEY, name: 'Credit/Debit Card', gateway: 'Stripe' },
  paypal: { available: !!PAYPAL_CLIENT_ID, name: 'PayPal', gateway: 'PayPal' },
  apple_pay: { available: !!STRIPE_KEY, name: 'Apple Pay', gateway: 'Stripe' },
  google_pay: { available: !!STRIPE_KEY, name: 'Google Pay', gateway: 'Stripe' },
  mtn_money: { available: !!FLUTTERWAVE_KEY, name: 'MTN Mobile Money', gateway: 'Flutterwave' },
  airtel_money: { available: !!FLUTTERWAVE_KEY, name: 'Airtel Money', gateway: 'Flutterwave' },
  bank_transfer: { available: true, name: 'Bank Transfer', gateway: FLUTTERWAVE_KEY ? 'Flutterwave' : 'Manual' },
  cash_on_delivery: { available: true, name: 'Cash on Delivery', gateway: 'Manual' },
};
