export type PaymentScheduleStatus = string;
export type PaymentStatus = string;

export interface PaymentScheduleClass {
  id: number | string;
  name: string;
}

export type PaymentOption =
  | string
  | {
      id?: number | string;
      label?: string;
      name?: string;
      type?: string;
    };

export interface PaymentSchedule {
  id: number | string;
  period_start: string;
  period_end: string;
  due_date: string;
  required_amount: number;
  outstanding_amount?: number | null;
  currency?: string;
  status: PaymentScheduleStatus;
  class: PaymentScheduleClass | string | null;
  payment_status: PaymentStatus;
  payment_options: PaymentOption[];
  allow_additional_infaq?: boolean;
  minimum_infaq?: number | string | null;
  maximum_infaq?: number | string | null;
}

export interface StudentPayment {
  id: number | string;
  amount: number;
  reference_number?: string | null;
  class?: PaymentScheduleClass | string | null;
  payment_method?: string | null;
  required_amount?: number | string | null;
  additional_infaq?: number | string | null;
  total_amount?: number | string | null;
  currency?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  status: PaymentStatus;
  payment_schedule?: Pick<PaymentSchedule, 'due_date' | 'period_start' | 'period_end'> | null;
}

export interface PaymentHistoryFilters {
  page?: number;
  per_page?: number;
  status?: string;
  payment_method?: string;
  class_id?: number | string;
  date_from?: string;
  date_to?: string;
}

export interface PaymentHistoryResponse<Item> {
  data: {
    payments: Item[];
    pagination: PaginationMeta;
  };
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
}

export interface PaginatedResponse<Item> {
  data: Item[];
  meta: PaginationMeta;
}
