import { PaymentProvider } from './types';
import { MockSandboxProvider } from './mockSandboxProvider';
import { RazorpayProvider } from './razorpayProvider';

let activeProvider: PaymentProvider | null = null;

export function getPaymentProvider(providerName?: string): PaymentProvider {
  const chosen = (providerName || process.env.PAYMENT_PROVIDER || 'RAZORPAY').toUpperCase();

  if (activeProvider && activeProvider.name === chosen) {
    return activeProvider;
  }

  if (chosen === 'RAZORPAY') {
    activeProvider = new RazorpayProvider();
  } else {
    activeProvider = new MockSandboxProvider();
  }

  return activeProvider;
}

export * from './types';
export { MockSandboxProvider } from './mockSandboxProvider';
export { RazorpayProvider } from './razorpayProvider';
