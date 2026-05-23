export function getApiBaseUrl(): string {
  const rawBaseUrl =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

  const normalized = rawBaseUrl.replace(/\/+$/, '');

  if (/\/api$/i.test(normalized)) {
    return normalized.replace(/\/api$/i, '');
  }

  return normalized;
}

export function getApiUrl(path = ''): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
