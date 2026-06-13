/**
 * Centralized API Client for Closet Inteligente da Lay.
 * Handles automatic Authorization header injection and user-friendly error translations.
 */

export function getAuthToken(): string | null {
  // Ensure the user has an active, authenticated session in the front-end first
  const activeUser = sessionStorage.getItem("closet_lay_active_user");
  if (!activeUser) {
    return null;
  }
  
  // Use the secure demo/configured token defined in the environments
  return ((import.meta as any).env?.VITE_DEMO_AUTH_TOKEN as string) || "dev-token-change-me";
}

export interface ApiFetchOptions extends RequestInit {
  // Helpful flags for custom behavior if needed
  skipAuth?: boolean;
}

/**
 * Custom fetch wrapper to secure and standardize all calls to our Express backend.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  // Set default JSON content type headers
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Inject Authorization token if authorization is required
  if (!skipAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Sua sessão expirou ou você não está logado. Por favor, faça login novamente.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
  };

  try {
    const response = await fetch(endpoint, finalOptions);

    // Trap specific security error codes
    if (response.status === 401) {
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }
    if (response.status === 403) {
      throw new Error("Acesso não autorizado. Sua sessão está inválida ou expirada.");
    }
    if (response.status === 429) {
      throw new Error("Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.");
    }
    if (response.status === 413) {
      throw new Error("Essa imagem está pesada demais. Tente enviar uma foto menor.");
    }

    // Attempt to parse response as JSON
    let responseData: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      // Use detailed back-end error messages if they exist
      const backEndError = responseData?.error || responseData?.details || "Falha na comunicação com o servidor.";
      throw new Error(backEndError);
    }

    return responseData as T;
  } catch (error: any) {
    // Forward friendly translated error messages
    if (error.message && (
      error.message.includes("Failed to fetch") || 
      error.message.includes("conectar") ||
      error.message.includes("NetworkError")
    )) {
      throw new Error("Não consegui conectar ao servidor. Verifique sua conexão de internet.");
    }
    throw error;
  }
}
