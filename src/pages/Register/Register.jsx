import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addUser, getUsers } from '../../services/api/users.js'
import { FcGoogle } from 'react-icons/fc'
import { FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi'
import './Register.css'

const FALLBACK_COUNTRIES = [
  { code: 'ID', label: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'MY', label: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'SG', label: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'TH', label: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'PH', label: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', label: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
]

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES)
  const [selectedCountryCode, setSelectedCountryCode] = useState('ID')
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const countryMenuRef = useRef(null)

  const selectedCountry = countries.find((country) => country.code === selectedCountryCode) || FALLBACK_COUNTRIES[0]

  useEffect(() => {
    let isMounted = true

    const loadCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2')
        if (!response.ok) {
          throw new Error('Failed to fetch countries')
        }

        const rawCountries = await response.json()
        const mappedCountries = rawCountries
          .map((country) => {
            const root = country.idd?.root
            const suffix = country.idd?.suffixes?.[0]
            const dialCode = root && suffix ? `${root}${suffix}` : null

            if (!country.cca2 || !country.name?.common || !dialCode) {
              return null
            }

            return {
              code: country.cca2,
              label: country.name.common,
              dialCode,
              flag: country.flag || '🏳️',
            }
          })
          .filter(Boolean)
          .sort((a, b) => a.label.localeCompare(b.label))

        if (isMounted && mappedCountries.length > 0) {
          setCountries(mappedCountries)
          setSelectedCountryCode((currentCode) => (
            mappedCountries.some((country) => country.code === currentCode)
              ? currentCode
              : mappedCountries[0].code
          ))
        }
      } catch {
        if (isMounted) {
          setCountries(FALLBACK_COUNTRIES)
        }
      }
    }

    loadCountries()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsEntering(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleInputChange = (field) => (event) => {
    const value = event.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}

    if (!formData.fullName.trim()) nextErrors.fullName = 'Nama lengkap wajib diisi.'
    if (!formData.email.trim()) nextErrors.email = 'E-Mail wajib diisi.'
    if (!formData.phoneNumber.trim()) nextErrors.phoneNumber = 'No. Hp wajib diisi.'
    if (!formData.password.trim()) nextErrors.password = 'Kata sandi wajib diisi.'
    if (!formData.confirmPassword.trim()) nextErrors.confirmPassword = 'Konfirmasi kata sandi wajib diisi.'
    if (
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi tidak sama.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const users = await getUsers()
      const email = formData.email.trim().toLowerCase()
      if (users.some((user) => user.email.toLowerCase() === email)) {
        setErrors({ email: 'E-Mail sudah terdaftar.' })
        return
      }
      await addUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${selectedCountry.dialCode}${formData.phoneNumber.trim()}`,
        password: formData.password,
      })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleRegister = () => {
    window.alert('Fitur belum dapat digunakan saat ini.')
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (countryMenuRef.current && !countryMenuRef.current.contains(event.target)) {
        setIsCountryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <main className="register-page">
      <section className="register-shell page-container">
        <div className={`register-card ${isEntering ? 'enter' : ''}`}>
          <h1 className="register-title">Pendaftaran Akun</h1>
          <p className="register-subtitle">Yuk, daftarkan akunmu sekarang juga!</p>

          <form className="register-form" onSubmit={handleSubmit}>
            <label className="register-label" htmlFor="register-name">Nama Lengkap <span>*</span></label>
            <input
              className={`register-input ${errors.fullName ? 'input-error' : ''}`}
              id="register-name"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange('fullName')}
            />
            {errors.fullName && <p className="register-error">{errors.fullName}</p>}

            <label className="register-label" htmlFor="register-email">E-Mail <span>*</span></label>
            <input
              className={`register-input ${errors.email ? 'input-error' : ''}`}
              id="register-email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
            />
            {errors.email && <p className="register-error">{errors.email}</p>}

            <label className="register-label" htmlFor="register-phone-number">No. Hp <span>*</span></label>
            <div className="register-phone-row">
              <div className="country-code country-select-wrap" ref={countryMenuRef}>
                <button
                  type="button"
                  className="country-trigger"
                  aria-label="Pilih kode negara"
                  aria-expanded={isCountryOpen}
                  onClick={() => setIsCountryOpen((prev) => !prev)}
                >
                  <span>{selectedCountry.flag} {selectedCountry.dialCode}</span>
                  <FiChevronDown className={`country-arrow-icon ${isCountryOpen ? 'open' : ''}`} aria-hidden="true" />
                </button>

                {isCountryOpen && (
                  <ul className="country-menu" role="listbox" aria-label="Daftar kode negara">
                    {countries.map((country) => (
                      <li key={country.code}>
                        <button
                          type="button"
                          className={`country-option ${country.code === selectedCountryCode ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCountryCode(country.code)
                            setIsCountryOpen(false)
                          }}
                        >
                          {country.flag} {country.dialCode}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <input
                className={`register-input ${errors.phoneNumber ? 'input-error' : ''}`}
                id="register-phone-number"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
              />
            </div>
            {errors.phoneNumber && <p className="register-error">{errors.phoneNumber}</p>}

            <label className="register-label" htmlFor="register-password">Kata Sandi <span>*</span></label>
            <div className="password-wrap">
              <input
                className={`register-input ${errors.password ? 'input-error' : ''}`}
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
              />
              <button
                type="button"
                className="eye-btn"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEye className="eye-icon" aria-hidden="true" /> : <FiEyeOff className="eye-icon" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && <p className="register-error">{errors.password}</p>}

            <label className="register-label" htmlFor="register-confirm-password">Konfirmasi Kata Sandi <span>*</span></label>
            <div className="password-wrap">
              <input
                className={`register-input ${errors.confirmPassword ? 'input-error' : ''}`}
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
              />
              <button
                type="button"
                className="eye-btn"
                aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                aria-pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FiEye className="eye-icon" aria-hidden="true" /> : <FiEyeOff className="eye-icon" aria-hidden="true" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="register-error">{errors.confirmPassword}</p>}

            <p className="forgot-wrap"><Link to="/login" className="forgot-link">Lupa Password?</Link></p>

            {submitError && <p className="register-error" role="alert">{submitError}</p>}

            <button type="submit" className="register-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Mendaftarkan…' : 'Daftar'}
            </button>
            <Link to="/login" className="register-login">Masuk</Link>

            <p className="divider">atau</p>

            <button type="button" className="google-btn" onClick={handleGoogleRegister}>
              <span className="google-mark" aria-hidden="true">
                <FcGoogle />
              </span>
              Daftar dengan Google
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Register
