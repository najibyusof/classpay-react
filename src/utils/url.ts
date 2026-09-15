export function isTrustedHttpsUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
