import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { isAdminCredentials } from '../../utils/adminAuth.js'
import './Login.css'

function Login({ onAdminLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    if (isAdminCredentials(email, password)) {
      setError('')
      onAdminLogin()
      navigate('/admin')
      return
    }
    setError('Email atau kata sandi salah.')
  }

  const handleGoogleLogin = () => {
    window.alert('Fitur belum bisa digunakan saat ini.')
  }

  const handleForgotPassword = (event) => {
    event.preventDefault()
    window.alert('Fitur belum bisa digunakan saat ini.')
  }

  return (
    <main className="login-page">
      <section className="login-shell page-container">
        <div className="login-card">
          <h1 className="login-title">Masuk ke Akun</h1>
          <p className="login-subtitle">Yuk, lanjutin belajarmu di videobelajar.</p>

          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label className="login-label" htmlFor="login-email">E-Mail <span>*</span></label>
            <input
              className="login-input"
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label className="login-label" htmlFor="login-password">Kata Sandi <span>*</span></label>
            <div className="login-password-wrap">
              <input
                className="login-input"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEye className="login-eye-icon" aria-hidden="true" /> : <FiEyeOff className="login-eye-icon" aria-hidden="true" />}
              </button>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <p className="login-forgot-wrap">
              <Link to="/login" className="login-forgot-link" onClick={handleForgotPassword}>Lupa Password?</Link>
            </p>

            <button className="login-submit" type="submit">Masuk</button>
            <Link to="/register" className="login-register-btn">Daftar</Link>

            <p className="login-divider">atau</p>

            <button type="button" className="login-google-btn" onClick={handleGoogleLogin}>
              <span className="login-google-mark" aria-hidden="true">
                <FcGoogle />
              </span>
              Masuk dengan Google
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Login
