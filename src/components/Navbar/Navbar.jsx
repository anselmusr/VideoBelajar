import { useState } from "react";
import './Navbar.css'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <a href="/" className="logo" aria-label="Video Belajar Home">
        <img src="/assets/logo.webp" alt="Video Belajar" />
      </a>

      <button
        className={`toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <ul className={`menu ${isOpen ? "active" : ""}`}>
        <li className="menu-item"><a href="#">Kategori</a></li>
        <li className="menu-item">
          <button type="button" className="btn btn-login">Login</button>
        </li>
        <li className="menu-item">
          <button type="button" className="btn btn-register">
            Register
          </button>
        </li>
      </ul>

    </nav>
  );
}

export default Navbar;