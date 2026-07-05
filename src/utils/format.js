export function formatCompactRupiah(value) {
  if (value >= 1000) {
    return `Rp ${Math.round(value / 1000)}K`
  }

  return `Rp ${value}`
}
