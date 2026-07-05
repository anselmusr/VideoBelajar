import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import { useCourses } from './hooks/useCourses.js'
import { footerContent, navbarContent } from './utils/siteContent.js'
import './App.css'

function ScrollToTopOnPathChange() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

function App() {
  const { courses } = useCourses()

  return (
    <>
      <Navbar
        logo={navbarContent.logo}
        links={navbarContent.links}
        actions={navbarContent.actions}
      />
      <ScrollToTopOnPathChange />
      <Routes>
        <Route path="/" element={<Home courses={courses} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
