import { useState } from "react";
import { Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import './Navbar.css'

function Navbar({ logo, links = [], actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false)

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

        {actions.map((item) => (
          <li key={item.id} className="menu-item">
            <Link
              to={item.to}
              className={`btn btn-${item.variant} nav-link-btn`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

    </nav>
  );
}

export default Navbar;
