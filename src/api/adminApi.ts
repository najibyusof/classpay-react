import { apiClient } from './client';

import type {
  AdminDashboardData,
  ClassPaymentSettingRequest,
  AdminClass,
  AdminClassListResponse,
  AdminParticipant,
  AdminParticipantListResponse,
  AdminPerson,
  AdminPersonListResponse,
  AdminOrganizationListResponse,
  AdminPayment,
  AdminReport,
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
  ): Promise<PaginatedResponse<AdminParticipant>> => {
    const { data } = await apiClient.get<AdminParticipantListResponse>(
      `/admin/classes/${classId}/participants`,
    );
    const payload = data.data;
    const participants = Array.isArray(payload) ? payload : (payload?.participants ?? []);
    const pagination = Array.isArray(payload) ? undefined : payload?.pagination;
    return {
      data: participants,
      meta: pagination ?? { current_page: 1, last_page: 1 },
    };
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
  getPayments: async (page = 1): Promise<PaginatedResponse<AdminPayment>> => {
    const { data } = await apiClient.get<PaymentHistoryResponse<AdminPayment>>('/admin/payments', {
      params: { page },
    });
    return { data: data.data.payments, meta: data.data.pagination };
  },
  getPaymentSummary: () => getReport('/admin/reports/payment-summary'),
  getOutstandingReport: () => getReport('/admin/reports/outstanding'),
  getOverdueReport: () => getReport('/admin/reports/overdue'),
};

async function getReport(path: string): Promise<AdminReport> {
  const { data } = await apiClient.get<AdminReport | { data: AdminReport }>(path);
  return unwrapData(data);
}

function unwrapData<Value>(value: Value | { data: Value }): Value {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    return value.data as Value;
  }
  return value;
}
