function rentToPrice(rent, price) {
  if (rent <= 0 || price <= 0) return -1
  return parseFloat((rent / price).toFixed(4))
}

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

function average(arr) {
  if (arr.length === 0) {
    return -1
  }
  const avg = arr.reduce((a, b) => a + b) / arr.length
  return Math.round(avg / 1000) * 1000
}

function median(arr) {
  if (arr.length == 0) {
    return -1
  }
  arr.sort((a, b) => a - b)
  const midpoint = Math.floor(arr.length / 2)
  const median =
    arr.length % 2 === 1
      ? arr[midpoint]
      : (arr[midpoint - 1] + arr[midpoint]) / 2
  return median
}

function pct25th(arr) {
  if (arr.length == 0) {
    return -1
  }
  arr.sort((a, b) => a - b)
  const index = Math.ceil(0.25 * arr.length) - 1
  return arr[index]
}

function pct75th(arr) {
  if (arr.length == 0) {
    return -1
  }
  arr.sort((a, b) => a - b)
  const index = Math.ceil(0.75 * arr.length) - 1
  return arr[index]
}

module.exports = {
  rentToPrice,
  toDollar,
  toPercent,
  average,
  median,
  pct25th,
  pct75th
}
