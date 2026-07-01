type FetchInput = Parameters<typeof window.fetch>[0];
type FetchInit = Parameters<typeof window.fetch>[1];

export function isLogoutRequest(input: FetchInput, init?: FetchInit) {
  let rawUrl = '';
  let method = init?.method;

  if (typeof input === 'string' || input instanceof URL) {
    rawUrl = String(input);
  } else {
    rawUrl = input.url;
    method = method ?? input.method;
  }

  try {
    const url = new URL(rawUrl, window.location.origin);
    return (
      url.pathname === '/api/auth/logout' &&
      (method ?? 'GET').toUpperCase() === 'POST'
    );
  } catch {
    return false;
  }
}

export function formatCreatedAt(value: string) {
  return new Date(value).toLocaleString();
}
