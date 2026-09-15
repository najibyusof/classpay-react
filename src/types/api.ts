import type { AxiosError } from 'axios';

export type ApiErrorKind =
  | 'configuration'
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'network'
  | 'unknown';

export class ApiError extends Error {
  readonly status?: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly kind: ApiErrorKind;
  readonly retryable: boolean;

  constructor({
    kind,
    message,
    status,
    fieldErrors = {},
    retryable = false,
  }: {
    kind: ApiErrorKind;
    message: string;
    status?: number;
    fieldErrors?: Record<string, string[]>;
    retryable?: boolean;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.kind = kind;
    this.retryable = retryable;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const status = axiosError.response?.status;
  const fieldErrors = axiosError.response?.data?.errors ?? {};

  if (!axiosError.response) {
    return new ApiError({
      kind: 'network',
      message:
        typeof window !== 'undefined'
          ? 'The API could not be reached from this browser. Check the API URL and backend CORS configuration.'
          : 'Unable to connect. Check your internet connection and try again.',
      retryable: true,
    });
  }

  const mappedError = statusErrorMap[status ?? 0];
  if (mappedError) {
    return new ApiError({ ...mappedError, fieldErrors, status });
  }

  if (status !== undefined && status >= 500) {
    return new ApiError({
      kind: 'server',
      message: 'Unable to complete your request. Please try again later.',
      retryable: true,
      status,
    });
  }

  return new ApiError({
    kind: 'unknown',
    message: 'Something went wrong. Please try again.',
    status,
  });
}

export const ApiErrorHandler = {
  canRetry: (failureCount: number, error: unknown): boolean => {
    const apiError = normalizeApiError(error);
    return apiError.retryable && failureCount < 1;
  },
  normalize: normalizeApiError,
};

export function toApiError(error: unknown): ApiError {
  return normalizeApiError(error);
}

const statusErrorMap: Record<number, Pick<ApiError, 'kind' | 'message' | 'retryable'>> = {
  400: { kind: 'bad_request', message: 'The request could not be completed.', retryable: false },
  401: {
    kind: 'unauthorized',
    message: 'Your session has expired. Please sign in again.',
    retryable: false,
  },
  403: {
    kind: 'forbidden',
    message: 'You do not have permission to access this resource.',
    retryable: false,
  },
  404: {
    kind: 'not_found',
    message: 'The requested resource could not be found.',
    retryable: false,
  },
  422: { kind: 'validation', message: 'Please correct the highlighted fields.', retryable: false },
  429: {
    kind: 'rate_limited',
    message: 'Too many requests. Please wait and try again.',
    retryable: false,
  },
  500: {
    kind: 'server',
    message: 'Unable to complete your request. Please try again later.',
    retryable: true,
  },
};
