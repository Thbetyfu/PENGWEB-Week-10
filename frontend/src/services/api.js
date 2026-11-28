/**
 * Layanan API Bengkelin
 * Berisi konfigurasi endpoint API Publik DummyJSON,
 * Autentikasi JWT (Week 11), dan RESTful API Backend NestJS + PostgreSQL Prisma ORM.
 */

export const URL_REFERENSI_MOTOR = "https://dummyjson.com/products/category/motorcycle";
export const URL_BACKEND_BASE = "http://localhost:3001";
export const URL_BACKEND_AUTH = `${URL_BACKEND_BASE}/auth`;
export const URL_BACKEND_SERVIS = `${URL_BACKEND_BASE}/servis`;

const TOKEN_STORAGE_KEY = "bengkelin_access_token";
const USER_STORAGE_KEY = "bengkelin_user";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseErrorResponse(res, fallbackMessage) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  const msg = Array.isArray(data?.message)
    ? data.message.join(", ")
    : data?.message || `${fallbackMessage} (Status: ${res.status})`;
  const error = new Error(msg);
  error.status = res.status;
  return error;
}

/**
 * Mengambil daftar referensi model motor dari API eksternal secara asinkron.
 */
export async function getReferensiMotor(signal) {
  let response;
  try {
    response = await fetch(URL_REFERENSI_MOTOR, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Tidak dapat terhubung ke server API referensi motor.");
  }

  if (!response.ok) {
    throw new Error(`Server API referensi merespons status ${response.status}.`);
  }

  const data = await response.json();
  if (!Array.isArray(data?.products)) {
    throw new Error("Format data dari API tidak sesuai.");
  }

  return data.products;
}

/**
 * -------------------------------------------------------------
 * OPERASI AUTENTIKASI JWT (WEEK 11 - BENGKELIN AUTH)
 * -------------------------------------------------------------
 */

export async function registerUser({ nama, email, password }) {
  const res = await fetch(`${URL_BACKEND_AUTH}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, email, password }),
  });

  if (!res.ok) {
    throw await parseErrorResponse(res, "Registrasi gagal");
  }
  return await res.json();
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${URL_BACKEND_AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      const err = new Error(
        "Terlalu banyak percobaan login (429 Too Many Requests). Silakan tunggu 1 menit."
      );
      err.status = 429;
      throw err;
    }
    throw await parseErrorResponse(res, "Login gagal");
  }

  const data = await res.json();
  if (data?.accessToken) {
    setAuthToken(data.accessToken);
  }
  if (data?.user) {
    setStoredUser(data.user);
  }
  return data;
}

/**
 * Pengujian akses endpoint privat /servis secara sengaja tanpa token (untuk verifikasi 401).
 */
export async function testUnauthorizedServis() {
  const res = await fetch(URL_BACKEND_SERVIS, {
    method: "GET",
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

/**
 * -------------------------------------------------------------
 * OPERASI CRUD BACKEND NESTJS (DILINDUNGI JWT BEARER)
 * -------------------------------------------------------------
 */

// 1. GET ALL SERVIS DARI BACKEND NESTJS
export async function fetchServisBackend() {
  const res = await fetch(URL_BACKEND_SERVIS, {
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, "Gagal memuat data dari NestJS API");
  }
  return await res.json();
}

// 2. CREATE SERVIS KE BACKEND NESTJS
export async function createServisBackend(servisBaru) {
  const res = await fetch(URL_BACKEND_SERVIS, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(servisBaru),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, "Gagal menambah data");
  }
  return await res.json();
}

// 3. UPDATE / PATCH STATUS SERVIS KE BACKEND NESTJS
export async function updateServisBackend(id, payload) {
  const res = await fetch(`${URL_BACKEND_SERVIS}/${id}`, {
    method: "PATCH",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, "Gagal update data");
  }
  return await res.json();
}

// 4. DELETE SERVIS DARI BACKEND NESTJS
export async function deleteServisBackend(id) {
  const res = await fetch(`${URL_BACKEND_SERVIS}/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, "Gagal menghapus data");
  }
  return await res.json();
}
