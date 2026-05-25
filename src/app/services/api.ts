export const BASE_URL = 'http://localhost:8080/hf';

interface ValidationFieldError {
  field?: string;
  defaultMessage?: string;
  message?: string;
}

function extractValidationMessage(errors: unknown): string | null {
  if (!Array.isArray(errors) || errors.length === 0) return null;

  const messages = errors
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object') {
        const e = entry as ValidationFieldError;
        return e.defaultMessage ?? e.message ?? null;
      }
      return null;
    })
    .filter((msg): msg is string => typeof msg === 'string' && msg.trim() !== '');

  return messages.length > 0 ? messages.join('; ') : null;
}

function extractErrorMessageFromJson(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return typeof data === 'string' && data.trim() !== '' ? data : fallback;
  }

  const body = data as Record<string, unknown>;

  if (typeof body.message === 'string' && body.message.trim() !== '') {
    return body.message;
  }
  if (typeof body.detail === 'string' && body.detail.trim() !== '') {
    return body.detail;
  }

  const validationMessage = extractValidationMessage(body.errors);
  if (validationMessage) return validationMessage;

  if (typeof body.error === 'string' && body.error.trim() !== '') {
    return body.error;
  }
  if (typeof body.title === 'string' && body.title.trim() !== '') {
    return body.title;
  }

  return fallback;
}

async function readErrorBody(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) return fallback;

  try {
    const parsed = JSON.parse(trimmed);
    return extractErrorMessageFromJson(parsed, fallback);
  } catch {
    return trimmed;
  }
}

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('hf_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const fallback = `Erro HTTP: ${response.status}`;
    let errorMessage = fallback;

    try {
      errorMessage = await readErrorBody(response, fallback);
    } catch {
      // Mantém mensagem padrão se o body não puder ser lido
    }

    // Apenas 401 indica sessão inválida/expirada. 403 pode ser regra de negócio
    // (ex.: não pode deletar cargo com usuários vinculados) — não deve deslogar.
    if (response.status === 401) {
      document.dispatchEvent(new Event('auth:logout'));
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json() as Promise<T>;
};
