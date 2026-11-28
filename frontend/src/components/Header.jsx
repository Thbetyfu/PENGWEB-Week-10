/**
 * Komponen 1: Header
 * Menampilkan identitas brand aplikasi Bengkelin, informasi pengguna yang login, dan tombol keluar.
 */
export default function Header({ user, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Bengkelin</h1>
            <p className="brand-tagline">Sistem Manajemen Servis Motor Konvensional &amp; Motor Listrik</p>
          </div>
        </div>
        <div className="header-meta">
          {user ? (
            <div className="header-user-actions">
              <span className="user-profile">
                {user.nama} ({user.email})
              </span>
              <button type="button" className="btn-logout" onClick={onLogout}>
                Keluar
              </button>
            </div>
          ) : (
            <span className="user-profile">Thoriq | 103022430006</span>
          )}
        </div>
      </div>
    </header>
  );
}
