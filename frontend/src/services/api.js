/**
 * Layanan API Bengkelin
 * Berisi konfigurasi endpoint API Publik DummyJSON (Week 7)
 * dan RESTful API Backend NestJS (Week 9 - Modul 9).
 */

export const URL_REFERENSI_MOTOR = "https://dummyjson.com/products/category/motorcycle";
export const URL_BACKEND_SERVIS = "http://localhost:3001/servis";

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
 * OPERASI CRUD BACKEND NESTJS (MODUL 9 - BENGKELIN API)
 * -------------------------------------------------------------
 */

// 1. GET ALL SERVIS DARI BACKEND NESTJS
export async function fetchServisBackend() {
  const res = await fetch(URL_BACKEND_SERVIS);
  if (!res.ok) {
    throw new Error(`Gagal memuat data dari NestJS API (Status: ${res.status})`);
  }
  return await res.json();
}

// 2. CREATE SERVIS KE BACKEND NESTJS
export async function createServisBackend(servisBaru) {
  const res = await fetch(URL_BACKEND_SERVIS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(servisBaru),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Gagal menambah data (${res.status})`;
    throw new Error(errorMsg);
  }
  return data;
}

// 3. UPDATE / PATCH STATUS SERVIS KE BACKEND NESTJS
export async function updateServisBackend(id, payload) {
  const res = await fetch(`${URL_BACKEND_SERVIS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Gagal update data (${res.status})`;
    throw new Error(errorMsg);
  }
  return data;
}

// 4. DELETE SERVIS DARI BACKEND NESTJS
export async function deleteServisBackend(id) {
  const res = await fetch(`${URL_BACKEND_SERVIS}/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Gagal menghapus data (${res.status})`);
  }
  return data;
}
