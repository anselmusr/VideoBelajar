import { useState } from "react";
import { Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import './Navbar.css'

function Navbar({ logo, links = [], actions = [], isAdmin = false, user = null, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false)

  const handleLogoutClick = () => {
    onLogout()
    closeMenu()
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo" aria-label={logo?.ariaLabel} onClick={closeMenu}>
        <img src={logo?.src} alt={logo?.alt} />
      </Link>

      <button
        type="button"
        className={`toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
      >
        {isOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </button>

      <ul id="primary-navigation" className={`menu ${isOpen ? "active" : ""}`}>
        {links.map((item) => (
          <li key={item.id} className="menu-item">
            <Link to={item.to} onClick={closeMenu}>{item.label}</Link>
          </li>
        ))}

        {isAdmin ? (
          <>
            <li className="menu-item">
              <Link
                to="/admin"
                className="btn btn-login nav-link-btn nav-admin-btn"
                onClick={closeMenu}
              >
                Admin Studio
              </Link>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className="btn btn-register nav-link-btn"
                onClick={handleLogoutClick}
              >
                Keluar
              </button>
            </li>
          </>
        ) : user ? (
          <>
            <li className="menu-item nav-user">Hai, {user.fullName?.split(' ')[0]}</li>
            <li className="menu-item">
              <button
                type="button"
                className="btn btn-register nav-link-btn"
                onClick={handleLogoutClick}
              >
                Keluar
              </button>
            </li>
          </>
        ) : (
          actions.map((item) => (
            <li key={item.id} className="menu-item">
              <Link
                to={item.to}
                className={`btn btn-${item.variant} nav-link-btn`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            </li>
          ))
        )}
      </ul>

    </nav>
  );
}

export default Navbar;
