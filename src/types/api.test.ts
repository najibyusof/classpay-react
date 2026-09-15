import { ApiErrorHandler, normalizeApiError } from './api';

function axiosError(status: number, errors?: Record<string, string[]>) {
  return {
    message: 'SQLSTATE[HY000] database password leaked',
    response: { data: { errors, message: 'Raw server exception' }, status },
  };
}

describe('normalizeApiError', () => {
  it.each([
    [400, 'bad_request'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [422, 'validation'],
    [429, 'rate_limited'],
    [500, 'server'],
  ] as const)('maps HTTP %s to safe %s error handling', (status, kind) => {
    const error = normalizeApiError(axiosError(status));

    expect(error.kind).toBe(kind);
    expect(error.message).not.toContain('SQLSTATE');
    expect(error.message).not.toContain('Raw server exception');
  });

  it('preserves backend field errors for React Hook Form validation', () => {
    const error = normalizeApiError(axiosError(422, { phone: ['The phone is invalid.'] }));

    expect(error.fieldErrors.phone).toEqual(['The phone is invalid.']);
  });

  it('maps a response-less failure to a retryable connection error', () => {
    const error = normalizeApiError({ message: 'Network Error' });

    expect(error.kind).toBe('network');
    expect(error.retryable).toBe(true);
  });

  it('retries at most once and never retries authorization, validation, or rate limit errors', () => {
    expect(ApiErrorHandler.canRetry(0, normalizeApiError({ message: 'Network Error' }))).toBe(true);
    expect(ApiErrorHandler.canRetry(1, normalizeApiError({ message: 'Network Error' }))).toBe(
      false,
    );
    expect(ApiErrorHandler.canRetry(0, normalizeApiError(axiosError(403)))).toBe(false);
    expect(ApiErrorHandler.canRetry(0, normalizeApiError(axiosError(422)))).toBe(false);
    expect(ApiErrorHandler.canRetry(0, normalizeApiError(axiosError(429)))).toBe(false);
  });
});
