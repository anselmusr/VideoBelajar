import { useState } from "react";
import { Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import './Navbar.css'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false)

  return (
    <nav className="navbar">
      <Link to="/" className="logo" aria-label="Video Belajar Home" onClick={closeMenu}>
        <img src="/assets/logo.webp" alt="Video Belajar" />
      </Link>

      <button
        className={`toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </button>

      <ul className={`menu ${isOpen ? "active" : ""}`}>
        <li className="menu-item">
          <Link to="/#kategori" onClick={closeMenu}>Kategori</Link>
        </li>
        <li className="menu-item">
          <Link to="/login" className="btn btn-login nav-link-btn" onClick={closeMenu}>Login</Link>
        </li>
        <li className="menu-item">
          <Link to="/register" className="btn btn-register nav-link-btn" onClick={closeMenu}>
            Register
          </Link>
        </li>
      </ul>

    </nav>
  );
}

export default Navbar;