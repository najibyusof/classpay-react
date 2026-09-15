import { apiClient } from '../api/client';

import type { MonetaryValue } from '../utils/money';

export type PaymentMethod = 'merchant' | 'qr' | 'bank_transfer' | 'manual';
export type PaymentCreationAudience = 'student' | 'sponsor';

export interface CreatePaymentRequest {
  additionalInfaq: string;
  paymentMethod: PaymentMethod;
}

export interface CreatedPayment {
  id: number | string;
  status: string;
  gateway_response?: PaymentGatewayResponse | null;
}

export interface PaymentGatewayResponse {
  payment_instructions?: string;
  qr_code_url?: string;
  qr_payload?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  amount?: MonetaryValue;
  currency?: string;
}

export const paymentCreationService = {
  create: async (
    audience: PaymentCreationAudience,
    scheduleId: number | string,
    request: CreatePaymentRequest,
  ): Promise<CreatedPayment> => {
    const { data } = await apiClient.post<CreatedPayment | { data: CreatedPayment }>(
      `/${audience}/payment-schedules/${scheduleId}/payments`,
      {
        additional_infaq: request.additionalInfaq,
        payment_method: request.paymentMethod,
      },
    );
    return 'data' in data ? data.data : data;
  },
};
