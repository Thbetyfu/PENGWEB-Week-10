import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import AuthPanel from "./components/AuthPanel";
import RingkasanStatistik from "./components/RingkasanStatistik";
import FormTambahServis from "./components/FormTambahServis";
import DaftarServis from "./components/DaftarServis";
import ReferensiMotor from "./components/ReferensiMotor";
import { dataServisAwal } from "./data/servisAwal";
import {
  clearAuthSession,
  createServisBackend,
  deleteServisBackend,
  fetchServisBackend,
  getAuthToken,
  getStoredUser,
  updateServisBackend,
} from "./services/api";
import "./App.css";

/**
 * Komponen Utama: App
 * Mengelola state autentikasi JWT (Week 11) serta alur integrasi Backend NestJS + Prisma ORM
 * untuk seluruh operasi CRUD aplikasi Bengkelin.
 */
export default function App() {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [daftarServis, setDaftarServis] = useState([]);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Menghubungkan ke NestJS API...");
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [pesanNotifikasi, setPesanNotifikasi] = useState(null);

  const tampilkanNotifikasi = useCallback((pesan, tipe = "info") => {
    setPesanNotifikasi({ pesan, tipe });
    setTimeout(() => setPesanNotifikasi(null), 4000);
  }, []);

  const handleLogout = useCallback(
    (alasan) => {
      clearAuthSession();
      setToken(null);
      setUser(null);
      setDaftarServis([]);
      setIsBackendConnected(false);
      tampilkanNotifikasi(
        typeof alasan === "string" ? alasan : "Anda telah keluar dari sesi.",
        "info"
      );
    },
    [tampilkanNotifikasi]
  );

  // Muat data dari Backend NestJS dengan header Authorization: Bearer <token>
  const muatDataDariBackend = useCallback(async () => {
    if (!token) return;
    setLoadingBackend(true);
    try {
      const data = await fetchServisBackend();
      setDaftarServis(data);
      setIsBackendConnected(true);
      setBackendStatus("Terhubung ke NestJS API (JWT Authenticated)");
    } catch (err) {
      if (err.status === 401) {
        handleLogout("Sesi JWT berakhir atau tidak valid (401). Silakan login kembali.");
        return;
      }
      console.warn("Backend offline atau gagal:", err.message);
      setIsBackendConnected(false);
      setBackendStatus("Mode Offline / Fallback Lokal (Backend belum aktif di port 3001)");
      setDaftarServis(dataServisAwal);
      tampilkanNotifikasi("Backend offline. Menggunakan data sampel lokal.", "warning");
    } finally {
      setLoadingBackend(false);
    }
  }, [token, handleLogout, tampilkanNotifikasi]);

  useEffect(() => {
    if (token) {
      muatDataDariBackend();
    }
  }, [token, muatDataDariBackend]);

  const handleLoginSuccess = (data) => {
    setToken(data.accessToken);
    setUser(data.user);
  };

  // Menambahkan servis baru via HTTP POST ke NestJS Backend
  const handleTambahServis = async (servisBaru) => {
    try {
      if (isBackendConnected) {
        const payload = {
          kendaraan: servisBaru.kendaraan,
          platNomor: servisBaru.platNomor,
          jenisMotor: servisBaru.jenisMotor,
          bengkel: servisBaru.bengkel,
          layanan: servisBaru.layanan,
          biaya: Number(servisBaru.biaya),
          tanggal: servisBaru.tanggal,
          status: servisBaru.status || "Dijadwalkan",
        };
        const hasil = await createServisBackend(payload);
        setDaftarServis((prev) => [hasil, ...prev]);
        tampilkanNotifikasi(`Servis baru ${hasil.id} berhasil ditambahkan ke Backend!`, "success");
      } else {
        setDaftarServis((prev) => [servisBaru, ...prev]);
        tampilkanNotifikasi("Data ditambahkan ke memori lokal.", "info");
      }
    } catch (err) {
      if (err.status === 401) {
        handleLogout("Sesi berakhir (401). Silakan login kembali.");
        return;
      }
      tampilkanNotifikasi(`Gagal menambah servis: ${err.message}`, "error");
      alert(`Validasi / Error Backend: ${err.message}`);
    }
  };

  // Menghapus data servis via HTTP DELETE ke NestJS Backend
  const handleHapusServis = async (id) => {
    if (!window.confirm(`Yakin ingin menghapus data servis ${id}?`)) return;

    try {
      if (isBackendConnected) {
        await deleteServisBackend(id);
        setDaftarServis((prev) => prev.filter((item) => item.id !== id));
        tampilkanNotifikasi(`Data servis ${id} berhasil dihapus dari Backend!`, "success");
      } else {
        setDaftarServis((prev) => prev.filter((item) => item.id !== id));
        tampilkanNotifikasi(`Data servis ${id} dihapus dari lokal.`, "info");
      }
    } catch (err) {
      if (err.status === 401) {
        handleLogout("Sesi berakhir (401). Silakan login kembali.");
        return;
      }
      tampilkanNotifikasi(`Gagal menghapus data: ${err.message}`, "error");
    }
  };

  // Mengubah status servis via HTTP PATCH ke NestJS Backend
  const handleToggleStatus = async (id) => {
    const itemTarget = daftarServis.find((item) => item.id === id);
    if (!itemTarget) return;

    const statusBaru = itemTarget.status === "Selesai" ? "Dijadwalkan" : "Selesai";

    try {
      if (isBackendConnected) {
        const hasil = await updateServisBackend(id, { status: statusBaru });
        setDaftarServis((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: hasil.status } : item))
        );
        tampilkanNotifikasi(`Status servis ${id} diperbarui menjadi "${statusBaru}"`, "success");
      } else {
        setDaftarServis((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: statusBaru } : item))
        );
      }
    } catch (err) {
      if (err.status === 401) {
        handleLogout("Sesi berakhir (401). Silakan login kembali.");
        return;
      }
      tampilkanNotifikasi(`Gagal memperbarui status: ${err.message}`, "error");
    }
  };

  const handleRefreshData = () => {
    muatDataDariBackend();
  };

  const handleKosongkanData = () => {
    setDaftarServis([]);
  };

  return (
    <div className="app-layout">
      <Header user={user} onLogout={() => handleLogout("Anda telah keluar dari sesi.")} />

      {/* Toast Notifikasi Feedback Operasi */}
      {pesanNotifikasi && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background:
              pesanNotifikasi.tipe === "success"
                ? "#065f46"
                : pesanNotifikasi.tipe === "error"
                ? "#991b1b"
                : "#1e3a8a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
            zIndex: 9999,
            fontWeight: "500",
            fontSize: "14px",
          }}
        >
          {pesanNotifikasi.pesan}
        </div>
      )}

      {!token ? (
        <main className="main-content">
          <AuthPanel
            onLoginSuccess={handleLoginSuccess}
            onNotify={tampilkanNotifikasi}
          />
        </main>
      ) : (
        <>
          <div
            style={{
              background: isBackendConnected ? "#ecfdf5" : "#fffbeb",
              borderBottom: `2px solid ${isBackendConnected ? "#10b981" : "#f59e0b"}`,
              padding: "10px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: isBackendConnected ? "#10b981" : "#f59e0b",
                }}
              />
              <strong style={{ color: isBackendConnected ? "#065f46" : "#92400e" }}>
                Status Fullstack:
              </strong>
              <span style={{ color: "#374151" }}>{backendStatus}</span>
            </div>
            <button
              type="button"
              onClick={handleRefreshData}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "4px 12px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "12px",
              }}
            >
              Muat Ulang dari Backend
            </button>
          </div>

          <main className="main-content">
            <div className="content-container">
              <RingkasanStatistik daftarServis={daftarServis} />

              <div className="demo-toolbar">
                <span className="demo-label">Opsi Pengujian Backend &amp; UI:</span>
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={handleKosongkanData}
                  title="Kosongkan seluruh data untuk menguji conditional rendering"
                >
                  Kosongkan Data (Uji Empty State)
                </button>
                <span className="demo-sep">|</span>
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={handleRefreshData}
                  title="Ambil ulang data dari backend NestJS"
                >
                  Ambil Ulang Data Backend
                </button>
              </div>

              <FormTambahServis onTambahServis={handleTambahServis} />

              {loadingBackend ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                  Memuat data antrean servis dari Backend NestJS...
                </div>
              ) : (
                <DaftarServis
                  daftarServis={daftarServis}
                  onHapusServis={handleHapusServis}
                  onToggleStatus={handleToggleStatus}
                  onResetSampel={handleRefreshData}
                />
              )}

              <ReferensiMotor />
            </div>
          </main>
        </>
      )}

      <footer className="app-footer">
        <p>Bengkelin Fullstack MVC &copy; Dikembangkan oleh Thoriq (NIM: 103022430006)</p>
      </footer>
    </div>
  );
}
