import './Hero.css'

function Hero() {
  return (
    <section className="hero-frame" aria-label="Hero section">
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-card">
          <h1>
            Revolusi Pembelajaran: Temukan Ilmu Baru melalui Platform Video Interaktif!
          </h1>
          <p>
            Temukan ilmu baru yang menarik dan mendalam melalui koleksi video pembelajaran berkualitas tinggi. Tidak hanya itu, Anda juga dapat berpartisipasi dalam latihan interaktif yang akan meningkatkan pemahaman Anda.
          </p>
          <div className="hero-actions">
            <a href="#featured-collection" className="button primary">
              Temukan Video Course untuk Dipelajari!
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero;
