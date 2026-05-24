export const BASE_URL = 'http://localhost:8080/hf';

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
    let errorMessage = `Erro HTTP: ${response.status}`;
    const contentType = response.headers.get('content-type') ?? '';

    try {
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage =
          errorData?.message ??
          errorData?.detail ??
          (typeof errorData?.error === 'string' ? errorData.error : null) ??
          errorMessage;
      } else {
        const text = (await response.text()).trim();
        if (text) {
          errorMessage = text;
        }
      }
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
