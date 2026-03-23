import type { CurrentUser } from '../auth/AuthProvider';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  user?: CurrentUser | null;
};

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
  }
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.user
        ? {
            'X-User-Id': options.user.userId,
            'X-User-Name': options.user.displayName,
          }
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new HttpError((payload as { detail?: string }).detail ?? 'Request failed.', response.status, payload);
  }

  return payload as T;
}

