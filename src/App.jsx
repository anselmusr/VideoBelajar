import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import { useCourses } from './hooks/useCourses.js'
import { footerContent, navbarContent } from './utils/siteContent.js'
import './App.css'

const ADMIN_SESSION_KEY = 'videobelajar.adminSession'

function readAdminSession() {
  try {
    return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

function ScrollToTopOnPathChange() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function App() {
  const { courses, isLoading, error, addCourse, updateCourse, deleteCourse, restoreCourse } =
    useCourses()
  const [isAdmin, setIsAdmin] = useState(readAdminSession)

  const handleAdminLogin = () => {
    setIsAdmin(true)
    try {
      window.localStorage.setItem(ADMIN_SESSION_KEY, 'true')
    } catch {
      // storage tidak tersedia — sesi hanya bertahan selama tab terbuka
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    try {
      window.localStorage.removeItem(ADMIN_SESSION_KEY)
    } catch {
      // storage tidak tersedia — tidak ada yang perlu dihapus
    }
  }

  return (
    <>
      <Navbar
        logo={navbarContent.logo}
        links={navbarContent.links}
        actions={navbarContent.actions}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <ScrollToTopOnPathChange />
      <Routes>
        <Route path="/" element={<Home courses={courses} isLoading={isLoading} error={error} />} />
        <Route path="/login" element={<Login onAdminLogin={handleAdminLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminDashboard
                courses={courses}
                isLoading={isLoading}
                error={error}
                addCourse={addCourse}
                updateCourse={updateCourse}
                deleteCourse={deleteCourse}
                restoreCourse={restoreCourse}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer
        brand={footerContent.brand}
        sections={footerContent.sections}
        socialLinks={footerContent.socialLinks}
        copyright={footerContent.copyright}
      />
      <Analytics />
    </>
  )
}

export default App
