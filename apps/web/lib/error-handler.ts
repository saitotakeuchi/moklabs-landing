/**
 * Error Handler Utility
 *
 * Provides user-friendly error messages and retry logic with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Map backend error codes/messages to user-friendly Portuguese messages
 */
export function getUserFriendlyErrorMessage(error: Error | string): string {
  const errorMessage = typeof error === "string" ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  // Network errors
  if (lowerMessage.includes("failed to fetch") || lowerMessage.includes("networkerror")) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return "A requisição demorou muito tempo. Por favor, tente novamente.";
  }

  // HTTP status codes
  if (lowerMessage.includes("404") || lowerMessage.includes("not found")) {
    return "O recurso solicitado não foi encontrado.";
  }

  if (lowerMessage.includes("500") || lowerMessage.includes("internal server error")) {
    return "Erro interno do servidor. Nossa equipe foi notificada.";
  }

  if (lowerMessage.includes("503") || lowerMessage.includes("service unavailable")) {
    return "O serviço está temporariamente indisponível. Tente novamente em alguns instantes.";
  }

  if (lowerMessage.includes("401") || lowerMessage.includes("unauthorized")) {
    return "Você não tem permissão para acessar este recurso.";
  }

  if (lowerMessage.includes("403") || lowerMessage.includes("forbidden")) {
    return "Acesso negado a este recurso.";
  }

  // File upload errors
  if (lowerMessage.includes("file too large") || lowerMessage.includes("exceeds maximum")) {
    return "O arquivo é muito grande. O tamanho máximo permitido é 50MB.";
  }

  if (lowerMessage.includes("invalid pdf") || lowerMessage.includes("not a pdf")) {
    return "O arquivo enviado não é um PDF válido.";
  }

  if (lowerMessage.includes("unsupported file type")) {
    return "Tipo de arquivo não suportado. Apenas arquivos PDF são aceitos.";
  }

  // SSE/Streaming errors
  if (lowerMessage.includes("connection") && lowerMessage.includes("lost")) {
    return "A conexão com o servidor foi perdida. Tente enviar a mensagem novamente.";
  }

  // Generic fallback
  return "Ocorreu um erro inesperado. Por favor, tente novamente.";
}

/**
 * Check if the error is retryable (network, timeout, 5xx errors)
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Network errors are retryable
  if (message.includes("failed to fetch") || message.includes("networkerror")) {
    return true;
  }

  // Timeouts are retryable
  if (message.includes("timeout") || message.includes("timed out")) {
    return true;
  }

  // 5xx server errors are retryable
  if (message.includes("500") || message.includes("503") || message.includes("502") || message.includes("504")) {
    return true;
  }

  // Connection errors are retryable
  if (message.includes("connection") && (message.includes("lost") || message.includes("refused") || message.includes("reset"))) {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if we've exhausted retries or error is not retryable
      if (attempt === maxRetries || !isRetryableError(lastError)) {
        throw lastError;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Wait for the browser to come online
 */
export function waitForOnline(timeout = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener("online", onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener("online", onlineHandler);
      resolve(true);
    };

    window.addEventListener("online", onlineHandler);
  });
}

/**
 * Create a timeout promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Request timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
