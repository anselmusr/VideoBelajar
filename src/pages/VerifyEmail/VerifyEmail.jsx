import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmailToken } from '../../services/api/auth.js'
import '../Login/Login.css'
import './VerifyEmail.css'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState(token ? 'loading' : 'error')
  const [errorMessage, setErrorMessage] = useState(
    token ? '' : 'Tautan verifikasi tidak lengkap. Buka tautan persis seperti di email.',
  )
  // StrictMode menjalankan efek dua kali, sedangkan token hanya sekali pakai —
  // pastikan tiap token cuma diverifikasi sekali. Menyimpan tokennya (bukan
  // boolean) supaya token yang berbeda tetap diproses.
  const requested = useRef(null)

  useEffect(() => {
    if (!token || requested.current === token) return
    requested.current = token
    verifyEmailToken(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        // Token hanya hilang dari database setelah verifikasi berhasil, jadi
        // "sudah dipakai" umumnya berarti akunnya memang sudah aktif.
        setErrorMessage(
          err.status === 400
            ? 'Tautan ini tidak berlaku lagi. Kalau kamu sudah pernah membukanya, akunmu sudah aktif — langsung masuk saja.'
            : err.message,
        )
      })
  }, [token])

  return (
    <main className="login-page">
      <section className="login-shell page-container">
        <div className="login-card">
          <h1 className="login-title">Verifikasi Email</h1>
          {status === 'loading' && (
            <p className="login-subtitle" role="status">Memverifikasi email kamu…</p>
          )}
          {status === 'success' && (
            <>
              <p className="login-success" role="status">
                Email berhasil diverifikasi. Akunmu sudah aktif!
              </p>
              <Link to="/login" className="login-submit verify-action">Masuk Sekarang</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="login-error" role="alert">{errorMessage}</p>
              <Link to="/login" className="login-submit verify-action">Masuk</Link>
              <Link to="/register" className="login-register-btn verify-action">Daftar Ulang</Link>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default VerifyEmail
