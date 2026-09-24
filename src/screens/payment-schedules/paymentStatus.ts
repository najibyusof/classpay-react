export type PaymentResultScreen = 'processing' | 'pending' | 'success' | 'failed';

export function getPaymentResultScreen(status: string | null | undefined): PaymentResultScreen {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'failed':
      return 'failed';
    case 'initiated':
      return 'processing';
    case 'pending':
    case 'refunded':
    default:
      return 'pending';
  }
}
