const { US_ADDRESS_REGEX } = require('./constants.js')

function matchAddresses(str) {
  return str.match(US_ADDRESS_REGEX)
}

// Calculates the rent to price ratio of a property given the monthly rent and sale price
function rentToPrice(rent, price) {
  if (rent <= 0 || price <= 0) return -1
  return parseFloat((rent / price).toFixed(4))
}

// Formats a number as a dollar amount with a leading currency symbol and removes trailing cents
function toDollar(amount) {
  if (amount < 0) return 'N/A'
  return amount
    .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    .replace(/\.\d{2}$/, '')
}

// Formats a number as a percentage with two decimal places and a trailing percent symbol
function toPercent(num) {
  if (num < 0) return 'N/A'
  return (num * 100).toFixed(2) + '%'
}

// Calculates the average of an array of numbers and rounds to the nearest thousand
function average(arr) {
  if (arr.length === 0) {
    return -1
  }
  const avg = arr.reduce((a, b) => a + b) / arr.length
  return Math.round(avg / 1000) * 1000
}

// Calculates the median of an array of numbers
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

// Calculates the 25th percentile of an array of numbers
function pct25th(arr) {
  if (arr.length == 0) {
    return -1
  }
  arr.sort((a, b) => a - b)
  const index = Math.ceil(0.25 * arr.length) - 1
  return arr[index]
}

// Calculates the 75th percentile of an array of numbers
function pct75th(arr) {
  if (arr.length == 0) {
    return -1
  }
  arr.sort((a, b) => a - b)
  const index = Math.ceil(0.75 * arr.length) - 1
  return arr[index]
}

// Searches for text that matches a pattern within the inner text of an element matching a selector
function matchedTexts(selector, pattern) {
  const element = document.querySelector(selector)
  if (!element) {
    return []
  }
  return element.innerText.replace(/\n/g, ' ').match(pattern)
}

// Searches for the first instance of text that matches a pattern within the inner text of an element matching a selector
function matchedText(selector, pattern) {
  const element = document.querySelector(selector)
  if (!element) {
    return null
  }
  return element.innerText.replace(/\n/g, ' ').match(pattern)
}

// Finds the first element matching a selector whose inner HTML matches a pattern
function findElement(selector, pattern) {
  const elements = document.querySelectorAll(selector)
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    if (element.innerHTML.match(pattern)) {
      return element
    }
  }
  return null
}

function serializeAddress(address) {
  return address.replace(/\u00A0/g, ' ').replace(/\s/g, ' ')
}

function parseUrlParams(url) {
  const searchParams = new URLSearchParams(url.split('?')[1])
  const paramsObj = {}
  for (const [key, value] of searchParams.entries()) {
    try {
      paramsObj[key] = JSON.parse(value)
    } catch (e) {
      paramsObj[key] = value
    }
  }
  return paramsObj
}

function encodeUrlParams(paramsObj) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(paramsObj)) {
    if (Array.isArray(value) || typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value))
    } else {
      searchParams.append(key, value)
    }
  }
  return searchParams.toString()
}

async function findElementUntil(selector, pattern, duration = 0) {
  const maxIterations = duration > 0 ? Math.ceil(duration / 300) : Infinity
  let searchCount = 0
  while (searchCount < maxIterations) {
    const elements = document.querySelectorAll(selector)
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      if (element.innerHTML.match(pattern)) {
        return element
      }
    }
    if (duration === 0) {
      return null
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
    searchCount++
  }
  return null
}

// Runs the specified function after the specified delay
async function doAfter(func, time) {
  await new Promise((resolve) => setTimeout(resolve, time))
  return func()
}

// Log message to screen
function logMessage(message) {
  // get local time
  const now = new Date()
  const timeStr = now.toLocaleTimeString()

  // process message
  let processedMessage = message
  processedMessage = processedMessage.replace(
    /successfully/gi,
    '<span style="color: green;">Successfully</span>'
  )
  processedMessage = processedMessage.replace(
    /failed/gi,
    '<span style="color: red;">Failed</span>'
  )
  processedMessage = processedMessage.replace(
    US_ADDRESS_REGEX,
    '<a href="https://www.zillow.com/homes/$&" target="_blank">$&</a>'
  )

  // format message with time prefix
  const messageStr = `[${timeStr}] ${processedMessage}`

  // check if banner element exists
  let banner = document.getElementById('banner')
  if (!banner) {
    // create banner element if it doesn't exist
    banner = document.createElement('div')
    banner.id = 'banner'
    banner.style.cssText =
      'position: absolute; z-index: 1000000; background-color: white; padding: 10px;'
    document.body.insertBefore(banner, document.body.firstChild)
  }

  // prepend message to banner element
  const messageElem = document.createElement('div')
  messageElem.innerHTML = messageStr
  banner.insertBefore(messageElem, banner.firstChild)
}

module.exports = {
  matchAddresses,
  rentToPrice,
  toDollar,
  toPercent,
  average,
  median,
  pct25th,
  pct75th,
  matchedText,
  matchedTexts,
  findElement,
  findElementUntil,
  serializeAddress,
  doAfter,
  logMessage,
  parseUrlParams,
  encodeUrlParams
}
