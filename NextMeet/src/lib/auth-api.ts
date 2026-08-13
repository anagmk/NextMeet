const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/$/, "");

export function getGoogleLoginUrl() {
  return `${apiBaseUrl}/auth/google`;
}

type AuthResponse = {
  message: string;
  user?: { id: string; name: string; email: string; role: string };
  refreshToken?: string;
};

let refreshToken: string | null = null;

function saveRefreshToken(response: AuthResponse) {
  refreshToken = response.refreshToken ?? null;
  return response;
}

type ApiErrorResponse = {
  message?: unknown;
  errors?: unknown;
};

class AuthApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

function getApiErrorMessage(data: ApiErrorResponse, status: number, path: string) {
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const details = Array.isArray(data.errors)
    ? data.errors.filter((error): error is string => typeof error === "string" && error.trim().length > 0)
    : [];

  // Never expose database field names or legacy provider details to users.
  if (/clerk\s*id|clerkid|duplicate key|e11000/i.test(`${message} ${details.join(" ")}`)) {
    return "An account with this email already exists. Please log in instead.";
  }

  if (message && !/^error (creating user|logging in)$/i.test(message)) {
    return details.length ? `${message}: ${details.join(", ")}` : message;
  }

  if (details.length) return details.join(", ");

  if (status === 400) {
    return path === "/login"
      ? "Please check your email address and password."
      : "Please check the details you entered and try again.";
  }
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The authentication service could not be found. Please try again later.";
  if (status === 409) return "An account with these details already exists.";
  if (status === 429) return "Too many attempts. Please wait a moment before trying again.";
  if (status >= 500) return "Our server could not complete your request. Please try again shortly.";

  return "We could not complete your request. Please try again.";
}

async function request<T>(path: string, body: Record<string, string>): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/auth${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AuthApiError("The request took too long. Please check your connection and try again.");
    }
    throw new AuthApiError("Unable to connect to the server. Please make sure it is running and try again.");
  } finally {
    window.clearTimeout(timeout);
  }

  const data = (await response.json().catch(() => ({}))) as AuthResponse & ApiErrorResponse;

  if (!response.ok) {
    throw new AuthApiError(getApiErrorMessage(data, response.status, path), response.status);
  }

  return data as T;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/login", { email, password }).then(saveRefreshToken);
}

export function signup(name: string, email: string, password: string) {
  return request<AuthResponse>("/signup", { name, email, password }).then(saveRefreshToken);
}

export async function refreshAccessToken() {
  if (!refreshToken) throw new AuthApiError("Your session has expired. Please log in again.", 401);
  return request<AuthResponse>("/refresh", { refreshToken }).then(saveRefreshToken);
}

export async function logout() {
  await request<AuthResponse>("/logout", refreshToken ? { refreshToken } : {});
  refreshToken = null;
}
