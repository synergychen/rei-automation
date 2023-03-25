function toDollar(amount) {
  if (amount < 0) return 'N/A'
  return amount
    .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    .replace(/\.\d{2}$/, '')
}

function toPercent(num) {
  if (num < 0) return 'N/A'
  return (num * 100).toFixed(2) + '%'
}


module.exports = { toDollar, toPercent }
