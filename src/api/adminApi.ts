import { apiClient } from './client';

import type {
  AdminDashboardData,
  ClassPaymentSettingRequest,
  ClassScheduleRequest,
  AdminClass,
  AdminClassSchedule,
  AdminClassListResponse,
  AdminParticipant,
  UpdateAdminPersonRequest,
  AdminParticipantListResponse,
  AdminPerson,
  AdminPersonListResponse,
  AdminOrganizationListResponse,
  AdminPayment,
  AdminReport,
  AdminReportFilters,
  UpdateOrganizationRequest,
  CreateClassRequest,
  CreateOrganizationRequest,
  AddClassParticipantRequest,
  ClassQrCodeAsset,
  UpdateClassRequest,
  OrganizationLogoAsset,
} from '../types/admin';
import type { PaginatedResponse, PaymentHistoryResponse } from '../types/student';

export const adminApi = {
  getOrganization: async (
    organizationId: number | string,
  ): Promise<AdminOrganizationListResponse['data']['organizations'][number]> => {
    const { data } = await apiClient.get<
      | AdminOrganizationListResponse['data']['organizations'][number]
      | {
          data: AdminOrganizationListResponse['data']['organizations'][number];
        }
    >(`/admin/organizations/${organizationId}`);
    return unwrapData(data);
  },
  getOrganizations: async (
    page = 1,
    perPage = 20,
  ): Promise<PaginatedResponse<AdminOrganizationListResponse['data']['organizations'][number]>> => {
    const { data } = await apiClient.get<AdminOrganizationListResponse>('/admin/organizations', {
      params: { page, per_page: perPage },
    });
    return { data: data.data.organizations, meta: data.data.pagination };
  },
  getDashboard: async (): Promise<AdminDashboardData> => {
    const { data } = await apiClient.get<AdminDashboardData | { data: AdminDashboardData }>(
      '/admin/dashboard',
    );
    return unwrapData(data);
  },
  createOrganization: async (
    payload: CreateOrganizationRequest,
  ): Promise<AdminOrganizationListResponse['data']['organizations'][number]> => {
    const { data } = await apiClient.post<
      | AdminOrganizationListResponse['data']['organizations'][number]
      | { data: AdminOrganizationListResponse['data']['organizations'][number] }
    >('/admin/organizations', payload);
    return unwrapData(data);
  },
  getOrganizationDashboard: async (
    organizationId: number | string,
  ): Promise<AdminDashboardData> => {
    const { data } = await apiClient.get<AdminDashboardData | { data: AdminDashboardData }>(
      `/admin/organizations/${organizationId}/dashboard`,
    );
    return unwrapData(data);
  },
  updateOrganization: async (
    organizationId: number | string,
    payload: UpdateOrganizationRequest,
  ): Promise<AdminOrganizationListResponse['data']['organizations'][number]> => {
    const { data } = await apiClient.patch<
      | AdminOrganizationListResponse['data']['organizations'][number]
      | { data: AdminOrganizationListResponse['data']['organizations'][number] }
    >(`/admin/organizations/${organizationId}`, payload);
    return unwrapData(data);
  },
  uploadOrganizationLogo: async (
    organizationId: number | string,
    asset: OrganizationLogoAsset,
  ): Promise<AdminOrganizationListResponse['data']['organizations'][number]> => {
    const formData = new FormData();
    formData.append('logo', {
      name: asset.name,
      type: asset.type,
      uri: asset.uri,
    } as unknown as Blob);
    const { data } = await apiClient.post<
      | AdminOrganizationListResponse['data']['organizations'][number]
      | { data: AdminOrganizationListResponse['data']['organizations'][number] }
    >(`/admin/organizations/${organizationId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapData(data);
  },
  getOrganizationLogoUrl: async (organizationId: number | string): Promise<string | null> => {
    const { data } = await apiClient.get<{ data: { logo_url: string | null } }>(
      `/admin/organizations/${organizationId}/logo`,
    );
    return data.data.logo_url;
  },
  getOrganizationClasses: async (
    organizationId: number | string,
    page = 1,
    perPage = 20,
  ): Promise<PaginatedResponse<AdminClass>> => {
    const { data } = await apiClient.get<AdminClassListResponse>(
      `/organizations/${organizationId}/classes`,
      { params: { page, per_page: perPage } },
    );
    return {
      data: data.data.classes,
      meta: data.data.pagination ?? { current_page: page, last_page: page },
    };
  },
  createOrganizationClass: async (
    organizationId: number | string,
    payload: CreateClassRequest,
  ): Promise<AdminClass> => {
    const { data } = await apiClient.post<AdminClass | { data: AdminClass }>(
      `/organizations/${organizationId}/classes`,
      payload,
    );
    return unwrapData(data);
  },
  getOrganizationClass: async (
    organizationId: number | string,
    classId: number | string,
  ): Promise<AdminClass> => {
    const { data } = await apiClient.get<AdminClass | { data: AdminClass }>(
      `/organizations/${organizationId}/classes/${classId}`,
    );
    return unwrapData(data);
  },
  getClassPaymentSetting: async (
    classId: number | string,
  ): Promise<NonNullable<AdminClass['payment_setting']>> => {
    const { data } = await apiClient.get<
      NonNullable<AdminClass['payment_setting']> | {
        data: NonNullable<AdminClass['payment_setting']>;
      }
    >(`/classes/${classId}/payment-setting`);
    return unwrapData(data);
  },
  updateOrganizationClass: async (
    organizationId: number | string,
    classId: number | string,
    payload: UpdateClassRequest,
  ): Promise<AdminClass> => {
    const { data } = await apiClient.patch<AdminClass | { data: AdminClass }>(
      `/organizations/${organizationId}/classes/${classId}`,
      payload,
    );
    return unwrapData(data);
  },
  updateClassSchedule: async (
    scheduleId: number | string,
    payload: ClassScheduleRequest,
  ): Promise<AdminClassSchedule> => {
    const { data } = await apiClient.patch<
      AdminClassSchedule | { data: AdminClassSchedule }
    >(`/class-schedules/${scheduleId}`, payload);
    return unwrapData(data);
  },
  updateClassPaymentSetting: async (
    classId: number | string,
    payload: ClassPaymentSettingRequest,
  ): Promise<AdminClass['payment_setting']> => {
    const { data } = await apiClient.patch<
      NonNullable<AdminClass['payment_setting']> | { data: NonNullable<AdminClass['payment_setting']> }
    >(`/classes/${classId}/payment-setting`, payload);
    return unwrapData(data);
  },
  uploadClassPaymentQrCode: async (
    classId: number | string,
    asset: ClassQrCodeAsset,
  ): Promise<AdminClass['payment_setting']> => {
    const formData = new FormData();
    formData.append('qr_code', {
      name: asset.name,
      type: asset.type,
      uri: asset.uri,
    } as unknown as Blob);
    const { data } = await apiClient.post<
      NonNullable<AdminClass['payment_setting']> | { data: NonNullable<AdminClass['payment_setting']> }
    >(`/classes/${classId}/payment-setting/qr-code`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapData(data);
  },
  getClassParticipants: async (
    classId: number | string,
    page = 1,
    perPage = 20,
  ): Promise<PaginatedResponse<AdminParticipant>> => {
    const response = page === 1 && perPage === 20
      ? await apiClient.get<AdminParticipantListResponse>(`/admin/classes/${classId}/participants`)
      : await apiClient.get<AdminParticipantListResponse>(`/admin/classes/${classId}/participants`, {
          params: { page, per_page: perPage },
        });
    const { data } = response;
    const payload = data.data;
    const participants = Array.isArray(payload) ? payload : (payload?.participants ?? []);
    const pagination = Array.isArray(payload) ? undefined : payload?.pagination;
    return {
      data: participants,
      meta: pagination ?? { current_page: page, last_page: page },
    };
  },
  getAllClassParticipants: async (classId: number | string): Promise<AdminParticipant[]> => {
    const participants: AdminParticipant[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const result = await adminApi.getClassParticipants(classId, page, 100);
      participants.push(...result.data);
      const lastPage = result.meta?.last_page ?? page;
      hasMore = page < lastPage;
      page += 1;
    }
    return participants;
  },
  addClassParticipant: async (
    classId: number | string,
    payload: AddClassParticipantRequest,
  ): Promise<AdminParticipant> => {
    const { data } = await apiClient.post<AdminParticipant | { data: AdminParticipant }>(
      `/admin/classes/${classId}/participants`,
      payload,
    );
    return unwrapData(data);
  },
  deleteClassParticipant: async (classId: number | string, participantId: number | string) => {
    await apiClient.delete(`/admin/classes/${classId}/participants/${participantId}`);
  },
  updateAdminStudent: async (
    studentId: number | string,
    payload: UpdateAdminPersonRequest,
  ): Promise<AdminPerson> => {
    const { data } = await apiClient.patch<AdminPerson | { data: AdminPerson }>(
      `/admin/students/${studentId}`,
      payload,
    );
    return unwrapData(data);
  },
  updateAdminSponsor: async (
    sponsorId: number | string,
    payload: UpdateAdminPersonRequest,
  ): Promise<AdminPerson> => {
    const { data } = await apiClient.patch<AdminPerson | { data: AdminPerson }>(
      `/admin/sponsors/${sponsorId}`,
      payload,
    );
    return unwrapData(data);
  },
  searchAdminStudents: async (phone: string): Promise<AdminPerson[]> => {
    const { data } = await apiClient.get<AdminPersonListResponse>('/admin/students', {
      params: { page: 1, per_page: 20, search: phone },
    });
    return data.data.students ?? [];
  },
  getAdminStudents: async (page = 1, perPage = 1): Promise<PaginatedResponse<AdminPerson>> => {
    const { data } = await apiClient.get<AdminPersonListResponse>('/admin/students', {
      params: { page, per_page: perPage },
    });
    return {
      data: data.data.students ?? [],
      meta: data.data.pagination ?? { current_page: page, last_page: page },
    };
  },
  searchAdminSponsors: async (phone: string): Promise<AdminPerson[]> => {
    const { data } = await apiClient.get<AdminPersonListResponse>('/admin/sponsors', {
      params: { page: 1, per_page: 20, search: phone },
    });
    return data.data.sponsors ?? [];
  },
  getAdminSponsors: async (page = 1, perPage = 1): Promise<PaginatedResponse<AdminPerson>> => {
    const { data } = await apiClient.get<AdminPersonListResponse>('/admin/sponsors', {
      params: { page, per_page: perPage },
    });
    return {
      data: data.data.sponsors ?? [],
      meta: data.data.pagination ?? { current_page: page, last_page: page },
    };
  },
  getPayments: async (
    page = 1,
    classId?: number | string,
    organizationId?: number | string,
    dateFrom?: string,
    dateTo?: string,
    participantId?: number | string,
  ): Promise<PaginatedResponse<AdminPayment>> => {
    const { data } = await apiClient.get<PaymentHistoryResponse<AdminPayment>>('/admin/payments', {
      params: {
        page,
        ...(classId === undefined ? {} : { class_id: classId }),
        ...(organizationId === undefined ? {} : { organization_id: organizationId }),
        ...(participantId === undefined ? {} : { participant_id: participantId }),
        ...(dateFrom === undefined ? {} : { date_from: dateFrom }),
        ...(dateTo === undefined ? {} : { date_to: dateTo }),
      },
    });
    return { data: data.data.payments, meta: data.data.pagination };
  },
  updatePayment: async (
    paymentId: number | string,
    payload: { status?: string; notes?: string | null },
  ): Promise<AdminPayment> => {
    const { data } = await apiClient.patch<AdminPayment | { data: AdminPayment }>(
      `/payments/${paymentId}`,
      payload,
    );
    return unwrapData(data);
  },
  getPaymentSummary: (filters?: AdminReportFilters) =>
    getReport('/admin/reports/payment-summary', filters),
  getOutstandingReport: (filters?: AdminReportFilters) =>
    getReport('/admin/reports/outstanding', filters),
  getOverdueReport: (filters?: AdminReportFilters) =>
    getReport('/admin/reports/overdue', filters),
  getOverduePayments: (filters?: AdminReportFilters) =>
    getReportValue('/admin/reports/overdue', filters),
  sendPaymentScheduleReminder: async (scheduleId: number | string): Promise<void> => {
    await apiClient.post(`/payment-schedules/${scheduleId}/reminder`);
  },
};

async function getReport(path: string, filters?: AdminReportFilters): Promise<AdminReport> {
  const response = filters && Object.keys(filters).length > 0
    ? await apiClient.get<AdminReport | { data: AdminReport }>(path, { params: filters })
    : await apiClient.get<AdminReport | { data: AdminReport }>(path);
  const { data } = response;
  return unwrapData(data);
}

async function getReportValue(path: string, filters?: AdminReportFilters): Promise<unknown> {
  const response = filters && Object.keys(filters).length > 0
    ? await apiClient.get<unknown>(path, { params: filters })
    : await apiClient.get<unknown>(path);
  return unwrapData(response.data as unknown);
}

function unwrapData<Value>(value: Value | { data: Value }): Value {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    return value.data as Value;
  }
  return value;
}
