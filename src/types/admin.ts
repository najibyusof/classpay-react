import type { StudentPayment } from './student';
import type { PaginationMeta } from './student';

export interface AdminOrganization {
  id: number | string;
  name: string;
  code?: string | null;
  description?: string | null;
  logo_path?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrganizationLogoAsset {
  uri: string;
  name: string;
  type: string;
}

export interface ClassQrCodeAsset {
  uri: string;
  name: string;
  type: string;
}

export interface AdminOrganizationListResponse {
  data: {
    organizations: AdminOrganization[];
    pagination: PaginationMeta & { per_page?: number; total?: number };
  };
}

export interface UpdateOrganizationRequest {
  name?: string;
  code?: string | null;
  description?: string | null;
  logo_path?: string | null;
  status?: 'active' | 'inactive';
}

export interface CreateOrganizationRequest {
  name: string;
  code?: string | null;
  description?: string | null;
  logo_path?: string | null;
  status?: 'active' | 'inactive';
}

export interface AdminClassSchedule {
  id?: number | string;
  class_id?: number | string;
  day_of_week?: number;
  start_time?: string | null;
  end_time?: string | null;
  recurrence_type?: 'weekly' | 'fortnightly' | 'monthly' | string;
}

export interface ClassScheduleRequest {
  day_of_week?: number;
  start_time?: string;
  end_time?: string | null;
  recurrence_type?: 'weekly' | 'fortnightly' | 'monthly';
}

export interface AdminClassPaymentSetting {
  id?: number | string;
  class_id?: number | string;
  required_amount?: number | string | null;
  currency?: string;
  payment_frequency?: string;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  qr_code_path?: string | null;
}

export interface ClassPaymentSettingRequest {
  required_amount?: number;
  currency?: string;
  payment_frequency?: 'weekly' | 'fortnightly' | 'monthly';
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
}

export interface AdminClass {
  id: number | string;
  organization_id?: number | string;
  name: string;
  description?: string | null;
  teacher_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  participants_count?: number;
  students_count?: number;
  payment_amount?: number | string | null;
  payment_qr_code?: string | null;
  payment_qr_path?: string | null;
  day_of_week?: number;
  start_time?: string | null;
  frequency?: 'weekly' | 'fortnightly' | 'monthly' | string;
  schedules?: AdminClassSchedule[];
  payment_setting?: AdminClassPaymentSetting | null;
}

export interface AdminClassListResponse {
  data: {
    classes: AdminClass[];
    pagination?: PaginationMeta & { per_page?: number; total?: number };
  };
}

export interface CreateClassRequest {
  name: string;
  teacher_name: string;
  day_of_week: number;
  start_time: string;
  recurrence_type: 'weekly' | 'fortnightly' | 'monthly';
  payment_amount: number;
  description?: string | null;
  status?: 'draft' | 'active' | 'inactive' | 'completed';
  start_date?: string | null;
  end_date?: string | null;
}

export type UpdateClassRequest = Partial<CreateClassRequest>;

export interface AdminParticipant {
  id: number | string;
  class_id?: number | string;
  user_id?: number | string;
  name?: string | null;
  phone?: string | null;
  participant_type?: 'student' | 'sponsor' | string;
  status?: string | null;
  joined_at?: string | null;
  left_at?: string | null;
  user?: {
    id: number | string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    user_type?: string;
    status?: string | null;
  } | null;
}

export interface AdminParticipantListResponse {
  data:
    | AdminParticipant[]
    | {
        participants: AdminParticipant[];
        pagination?: PaginationMeta & { per_page?: number; total?: number };
      };
}

export interface AddClassParticipantRequest {
  user_id: number | string;
  participant_type: 'student' | 'sponsor';
}

export interface AdminPerson {
  id: number | string;
  name: string;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
}

export interface UpdateAdminPersonRequest {
  name?: string;
  phone?: string;
  email?: string | null;
}

export interface AdminPersonListResponse {
  data: {
    students?: AdminPerson[];
    sponsors?: AdminPerson[];
    pagination?: PaginationMeta & { per_page?: number; total?: number };
  };
}

export interface AdminDashboardData {
  organizations?: unknown;
  [key: string]: unknown;
}

export interface AdminPayment extends StudentPayment {
  organization?: AdminOrganization | null;
}

export interface AdminReport {
  [key: string]: unknown;
}

export interface AdminReportFilters {
  organization_id?: number | string;
  class_id?: number | string;
  participant_id?: number | string;
  student_id?: number | string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export function getAuthorizedOrganizations(value: unknown): AdminOrganization[] {
  if (isAdminOrganization(value)) return [value];

  if (isResourceCollection(value)) {
    return value.data.filter(isAdminOrganization);
  }

  if (!Array.isArray(value)) return [];

  return value.filter(isAdminOrganization);
}

function isResourceCollection(value: unknown): value is { data: unknown[] } {
  return (
    typeof value === 'object' && value !== null && Array.isArray((value as { data?: unknown }).data)
  );
}

export function getOrganizationCount(data: AdminDashboardData): number {
  const explicitCount = [
    data.organization_count,
    data.organizations_count,
    data.total_organizations,
  ].find((value): value is number => typeof value === 'number');

  if (explicitCount !== undefined) return explicitCount;
  if (typeof data.organizations === 'number') return data.organizations;
  return getAuthorizedOrganizations(data.organizations).length;
}

function isAdminOrganization(value: unknown): value is AdminOrganization {
  if (typeof value !== 'object' || value === null) return false;
  const organization = value as Record<string, unknown>;
  return (
    (typeof organization.id === 'string' || typeof organization.id === 'number') &&
    typeof organization.name === 'string'
  );
}
