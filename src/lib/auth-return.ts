// Only known internal destinations may be used after OAuth.
export function authReturnPath(value: unknown) {
  return value === '/admin' || value === '/tiktok-live' ? value : '/account';
}
