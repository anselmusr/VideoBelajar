import './CallToAction.css'

function CallToAction() {
  const handleNewsletterSubmit = (event) => {
    event.preventDefault()
    window.alert('Fitur belum bisa digunakan saat ini.')
  }

  return (
    <section className="section-wrap newsletter-cta" aria-label="Newsletter">
      <div className="page-container">
        <div className="newsletter-banner">
          <div className="newsletter-content">
            <span className="newsletter-label">NEWSLETTER</span>
            <h2>Mau Belajar Lebih Banyak?</h2>
            <p>
              Daftarkan dirimu untuk mendapatkan informasi terbaru dan penawaran
              spesial dari program-program terbaik hariesok.id
            </p>

            <form
              id="newsletter-form"
              className="newsletter-form"
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                name="email"
                placeholder="Masukkan Emailmu"
                autoComplete="email"
                aria-label="Email"
                required
              />
              <button type="submit">Subscribe</button>
            </form>

            <button type="submit" form="newsletter-form" className="newsletter-submit-mobile">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
