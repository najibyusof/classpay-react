import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaymentHistoryFilters,
  PaymentHistoryResponse,
  PaymentSchedule,
  StudentClass,
  StudentOrganization,
  StudentPayment,
} from '../types/student';

export const studentApi = {
  getMyOrganizations: async (): Promise<PaginatedResponse<StudentOrganization>> => {
    const { data } = await apiClient.get<
      | PaginatedResponse<StudentOrganization>
      | { data: StudentOrganization[] }
      | {
          data: {
            organizations: StudentOrganization[];
            pagination?: PaginatedResponse<StudentOrganization>['meta'];
          };
        }
    >('/student/organizations');
    const payload = data as {
      data:
        | StudentOrganization[]
        | {
            organizations?: StudentOrganization[];
            pagination?: PaginatedResponse<StudentOrganization>['meta'];
          };
      meta?: PaginatedResponse<StudentOrganization>['meta'];
    };
    if (Array.isArray(payload.data)) {
      return {
        data: payload.data,
        meta: payload.meta ?? { current_page: 1, last_page: 1 },
      };
    }
    const wrapped = payload.data;
    return {
      data: wrapped.organizations ?? [],
      meta: wrapped.pagination ?? payload.meta ?? { current_page: 1, last_page: 1 },
    };
  },
  getMyClasses: async (page = 1): Promise<PaginatedResponse<StudentClass>> => {
    const { data } = await apiClient.get<
      | PaginatedResponse<StudentClass>
      | { data: StudentClass[] }
      | { data: { classes: StudentClass[]; pagination?: PaginatedResponse<StudentClass>['meta'] } }
    >('/student/classes', {
      params: { page },
    });
    const payload = data as {
      data: StudentClass[] | { classes?: StudentClass[]; pagination?: PaginatedResponse<StudentClass>['meta'] };
      meta?: PaginatedResponse<StudentClass>['meta'];
    };
    if (Array.isArray(payload.data)) {
      return {
        data: payload.data,
        meta: payload.meta ?? { current_page: page, last_page: page },
      };
    }
    const wrapped = payload.data;
    return {
      data: wrapped.classes ?? [],
      meta: wrapped.pagination ?? payload.meta ?? { current_page: page, last_page: page },
    };
  },
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
