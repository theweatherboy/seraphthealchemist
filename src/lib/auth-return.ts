// Only known internal destinations may be used after OAuth.
export const AUTH_RETURN_COOKIE = 'sanctuary-auth-return';

export function authReturnPath(value: unknown) {
  return value === '/admin' || value === '/tiktok-live' ? value : '/account';
}
