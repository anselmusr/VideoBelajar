import { Link } from 'react-router-dom'
import './Hero.css'

function Hero({ ariaLabel = 'Hero section', title, description, cta, backgroundImage }) {
  const heroStyle = backgroundImage
    ? { '--hero-background-image': `url(${backgroundImage})` }
    : undefined

  return (
    <section className="hero-frame" aria-label={ariaLabel} style={heroStyle}>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-card">
          <h1>{title}</h1>
          <p>{description}</p>
          {cta && (
            <div className="hero-actions">
              {cta.to ? (
                <Link to={cta.to} className="button primary">
                  {cta.label}
                </Link>
              ) : (
                <a href={cta.href} className="button primary">
                  {cta.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero;
