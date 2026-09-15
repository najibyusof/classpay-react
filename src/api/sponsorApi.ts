import { apiClient } from './client';
import type {
  SponsorPaymentPage,
  SponsorPayment,
  SponsorPaymentSchedule,
  SponsorSchedulePage,
} from '../types/sponsor';
import type { PaymentHistoryFilters, PaymentHistoryResponse } from '../types/student';

export const sponsorApi = {
  getPaymentSchedules: async (page = 1): Promise<SponsorSchedulePage> => {
    const { data } = await apiClient.get<SponsorSchedulePage>('/sponsor/payment-schedules', {
      params: { page },
    });
    return data;
  },
  getCurrentPaymentSchedules: async (): Promise<SponsorPaymentSchedule[]> => {
    const { data } = await apiClient.get<
      SponsorPaymentSchedule[] | { data: SponsorPaymentSchedule[] }
    >('/sponsor/payment-schedules/current');
    return Array.isArray(data) ? data : data.data;
  },
  getPaymentSchedule: async (scheduleId: number | string): Promise<SponsorPaymentSchedule> => {
    const { data } = await apiClient.get<SponsorPaymentSchedule | { data: SponsorPaymentSchedule }>(
      `/sponsor/payment-schedules/${scheduleId}`,
    );
    return 'data' in data ? data.data : data;
  },
  getPayments: async (
    filters: PaymentHistoryFilters | number = {},
  ): Promise<SponsorPaymentPage> => {
    const params = typeof filters === 'number' ? { page: filters } : filters;
    const { data } = await apiClient.get<PaymentHistoryResponse<SponsorPayment>>(
      '/sponsor/payments',
      { params },
    );
    return { data: data.data.payments, meta: data.data.pagination };
  },
};
