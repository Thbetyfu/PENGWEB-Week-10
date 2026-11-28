import { useState } from "react";
import { loginUser, registerUser, testUnauthorizedServis } from "../services/api";

/**
 * Komponen Autentikasi (Login & Register) untuk Bengkelin.
 * Menggunakan JWT Bearer Auth dan menampilkan umpan balik status HTTP (401/429).
 */
export default function AuthPanel({ onLoginSuccess, onNotify }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [hasilUji401, setHasilUji401] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
        await registerUser({ nama, email, password });
        setInfoMsg("Registrasi berhasil! Password telah di-hash dengan bcrypt. Silakan login.");
        onNotify?.("Registrasi berhasil. Silakan masuk dengan akun Anda.", "success");
        setMode("login");
        setPassword("");
      } else {
        const data = await loginUser({ email, password });
        onNotify?.(`Selamat datang, ${data.user?.nama || "Pengguna"}!`, "success");
        onLoginSuccess(data);
      }
    } catch (err) {
      setErrorMsg(err.message);
      onNotify?.(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUjiTanpaToken = async () => {
    setHasilUji401(null);
    try {
      const res = await testUnauthorizedServis();
      setHasilUji401(res);
    } catch (err) {
      setHasilUji401({ status: "Network Error", body: { message: err.message } });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{mode === "login" ? "Masuk ke Bengkelin" : "Daftar Akun Baru"}</h2>
          <p>
            {mode === "login"
              ? "Silakan masuk untuk mengakses manajemen servis motor."
              : "Buat akun untuk mendapatkan akses penuh ke layanan Bengkelin."}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setErrorMsg("");
              setInfoMsg("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setErrorMsg("");
              setInfoMsg("");
            }}
          >
            Register
          </button>
        </div>

        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {infoMsg && <div className="auth-alert success">{infoMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="auth-nama">Nama Lengkap</label>
              <input
                id="auth-nama"
                type="text"
                placeholder="Contoh: Thoriq Abdurrohman"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                minLength={2}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder={mode === "register" ? "Minimal 6 karakter" : "Masukkan password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 6 : 1}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Masuk"
              : "Daftar Akun"}
          </button>
        </form>

        <div className="auth-security-test">
          <p className="auth-security-caption">
            Pengujian Keamanan (Tanpa Token):
          </p>
          <button
            type="button"
            className="btn-text-action"
            onClick={handleUjiTanpaToken}
          >
            Uji Akses GET /servis Tanpa Token (Cek 401 di Network)
          </button>
          {hasilUji401 && (
            <pre className="auth-test-result">
              {`HTTP Status: ${hasilUji401.status}\n${JSON.stringify(hasilUji401.body, null, 2)}`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
