import nodemailer from 'nodemailer'

// Gagal saat boot, bukan diam-diam saat kirim: kalau produksi jatuh ke Ethereal,
// email verifikasi tak pernah sampai ke user sementara register tetap membalas
// 201, sehingga setiap akun yang mendaftar terkunci selamanya di login 403.
if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST) {
  throw new Error('SMTP_HOST wajib diset di produksi (fallback Ethereal hanya untuk dev).')
}

// Pakai SMTP dari env kalau ada; kalau tidak, otomatis buat akun uji Ethereal
// (email tidak benar-benar terkirim keluar, tapi bisa dibuka lewat preview URL
// yang di-log — cocok untuk demo misi tanpa kredensial SMTP sungguhan).
let transporterPromise

function getTransporter() {
  // Jangan cache promise yang gagal (mis. Ethereal gagal saat internet mati),
  // supaya register berikutnya bisa mencoba lagi tanpa restart server.
  transporterPromise ??= (async () => {
    if (process.env.SMTP_HOST) {
      return {
        isTest: false,
        transporter: nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        }),
      }
    }
    const test = await nodemailer.createTestAccount()
    return {
      isTest: true,
      transporter: nodemailer.createTransport({
        host: test.smtp.host,
        port: test.smtp.port,
        secure: test.smtp.secure,
        auth: { user: test.user, pass: test.pass },
      }),
    }
  })().catch((error) => {
    transporterPromise = undefined
    throw error
  })
  return transporterPromise
}

// Escape nilai user sebelum masuk template HTML email (cegah injeksi/phishing).
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Kirim token verifikasi; mengembalikan preview URL saat memakai Ethereal.
export async function sendVerificationEmail({ to, fullname, token }) {
  const { transporter, isTest } = await getTransporter()
  // APP_URL = origin frontend (halaman React /verify-email), bukan API
  const base = process.env.APP_URL ?? 'http://localhost:5173'
  const link = `${base}/verify-email?token=${encodeURIComponent(token)}`
  const safeName = escapeHtml(fullname)
  const safeLink = escapeHtml(link)
  const info = await transporter.sendMail({
    from: '"EduCourse VideoBelajar" <no-reply@videobelajar.local>',
    to,
    subject: 'Verifikasi Email EduCourse',
    text: `Halo ${fullname},\n\nVerifikasi akunmu lewat tautan berikut:\n${link}\n`,
    html: `<p>Halo <strong>${safeName}</strong>,</p>
           <p>Terima kasih sudah mendaftar di EduCourse. Klik tombol di bawah untuk verifikasi akunmu:</p>
           <p><a href="${safeLink}" style="background:#3ecf4c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Verifikasi Email</a></p>
           <p>Atau salin tautan ini: ${safeLink}</p>`,
  })
  const preview = isTest ? nodemailer.getTestMessageUrl(info) : null
  if (preview) console.log('[mailer] preview email:', preview)
  return preview
}
