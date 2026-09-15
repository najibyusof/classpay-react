import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaymentHistoryFilters,
  PaymentHistoryResponse,
  PaymentSchedule,
  StudentPayment,
} from '../types/student';

export const studentApi = {
  getPaymentSchedules: async (page = 1): Promise<PaginatedResponse<PaymentSchedule>> => {
    const { data } = await apiClient.get<PaginatedResponse<PaymentSchedule>>(
      '/student/payment-schedules',
      {
        params: { page },
      },
    );
    return data;
  },
  getPaymentSchedule: async (scheduleId: number | string): Promise<PaymentSchedule> => {
    const { data } = await apiClient.get<PaymentSchedule | { data: PaymentSchedule }>(
      `/student/payment-schedules/${scheduleId}`,
    );
    return 'data' in data ? data.data : data;
  },
  getCurrentPaymentSchedule: async (): Promise<PaymentSchedule | null> => {
    const { data } = await apiClient.get<PaymentSchedule | { data: PaymentSchedule | null }>(
      '/student/payment-schedules/current',
    );
    return 'data' in data ? data.data : data;
  },
  getPayments: async (
    filters: PaymentHistoryFilters | number = {},
  ): Promise<PaginatedResponse<StudentPayment>> => {
    const params = typeof filters === 'number' ? { page: filters } : filters;
    const { data } = await apiClient.get<PaymentHistoryResponse<StudentPayment>>(
      '/student/payments',
      {
        params,
      },
    );
    return { data: data.data.payments, meta: data.data.pagination };
  },
};
