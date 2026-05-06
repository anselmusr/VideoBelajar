import './CallToAction.css'

function CallToAction({
  ariaLabel = 'Newsletter',
  label,
  title,
  description,
  emailLabel = 'Email',
  placeholder,
  buttonLabel,
  unavailableMessage = 'Fitur belum bisa digunakan saat ini.',
  onSubmit,
}) {
  const formId = 'newsletter-form'

  const handleSubmit = (event) => {
    event.preventDefault()

    if (onSubmit) {
      onSubmit(event)
      return
    }

    window.alert(unavailableMessage)
  }

  return (
    <section className="section-wrap newsletter-cta" aria-label={ariaLabel}>
      <div className="page-container">
        <div className="newsletter-banner">
          <div className="newsletter-content">
            <span className="newsletter-label">{label}</span>
            <h2>{title}</h2>
            <p>{description}</p>

            <form
              id={formId}
              className="newsletter-form"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                name="email"
                placeholder={placeholder}
                autoComplete="email"
                aria-label={emailLabel}
                required
              />
              <button type="submit">{buttonLabel}</button>
            </form>

            <button type="submit" form={formId} className="newsletter-submit-mobile">
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
