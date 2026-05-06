import { createElement, useState } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import './Footer.css'

function Footer({ brand, sections = [], socialLinks = [], copyright }) {
  const [openSection, setOpenSection] = useState(null)

  const toggleSection = (sectionId) => {
    setOpenSection((current) => (current === sectionId ? null : sectionId))
  }

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="page-container footer-top">
        <section className="footer-brand" aria-label="Informasi perusahaan">
          <img src={brand?.logo} alt={brand?.logoAlt} className="footer-logo" loading="lazy" />
          <h3>{brand?.title}</h3>
          <p>{brand?.address}</p>
          <p>{brand?.phone}</p>
        </section>

        <nav className="footer-links" aria-label="Navigasi footer">
          {sections.map((section) => {
            const isOpen = openSection === section.id

            return (
              <div key={section.id} className="footer-link-group">
                <h4>
                  <button
                    type="button"
                    className="footer-section-toggle"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    aria-controls={`footer-${section.id}`}
                  >
                    <span>{section.title}</span>
                    <FiChevronRight className="footer-toggle-icon" aria-hidden="true" />
                  </button>
                </h4>
                <ul id={`footer-${section.id}`} className={isOpen ? 'is-open' : ''}>
                  {section.items.map((item) => {
                    const footerItem = typeof item === 'string'
                      ? { label: item, href: '#' }
                      : item

                    return (
                      <li key={`${section.id}-${footerItem.label}`}>
                        <a href={footerItem.href}>{footerItem.label}</a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>
      </div>

      <div className="page-container footer-bottom">
        <p>&copy; {new Date().getFullYear()} {copyright}</p>
        <div className="footer-social" aria-label="Media sosial">
          {socialLinks.map(({ id, label, href, icon }) => (
            <a key={id} href={href} aria-label={label}>
              {createElement(icon, { 'aria-hidden': true })}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
