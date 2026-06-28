const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getAuthHeaders() {
  if (typeof window === "undefined") {
    try {
      const { headers } = await import("next/headers");
      const h = await headers();
      const cookie = h.get("cookie");
      return cookie ? { cookie } : {};
    } catch {
      return {};
    }
  }

  try {
    const { authClient } = await import("./auth-client");
    const session = await authClient.getSession();
    const token = session?.data?.session?.token;
    if (token) {
      return { cookie: `better-auth.session_token=${token}` };
    }
  } catch {
    // ignore — unauthenticated request
  }
  return {};
}

async function request(path, { method = "GET", body, headers = {}, auth = false } = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const authHeaders = auth ? await getAuthHeaders() : {};

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new ApiError(err.message || "Network request failed", 0);
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message =
      (data && data.error) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export { ApiError, API_BASE, getAuthHeaders };
