import type { PaginatedResponse, PaymentSchedule, StudentPayment } from './student';

export interface SponsoredStudent {
  id: number | string;
  name: string;
}

export interface SponsorPaymentSchedule extends PaymentSchedule {
  student: SponsoredStudent | null;
}

export interface SponsorPayment extends StudentPayment {
  student: SponsoredStudent | null;
}

export type SponsorSchedulePage = PaginatedResponse<SponsorPaymentSchedule>;
export type SponsorPaymentPage = PaginatedResponse<SponsorPayment>;
