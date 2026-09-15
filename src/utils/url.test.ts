import { isTrustedHttpsUrl } from './url';

describe('isTrustedHttpsUrl', () => {
  it('allows HTTPS resources only', () => {
    expect(isTrustedHttpsUrl('https://api.example.com/qr.png')).toBe(true);
    expect(isTrustedHttpsUrl('http://api.example.com/qr.png')).toBe(false);
    expect(isTrustedHttpsUrl('data:image/png;base64,unsafe')).toBe(false);
    expect(isTrustedHttpsUrl('file:///private/qr.png')).toBe(false);
  });
});
