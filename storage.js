/**
 *
 * @param {string} path
 *  Example: "<zipcode>.<bedrooms>.<forSale/sold/rent>"
 * @param {any} value
 *  Example: { average: 100, median: 90 }
 * @returns {any}
 */

function updateLocalREIData(path, value) {
  let keys = path.split('.')
  let data = JSON.parse(localStorage.getItem(localStorageKey())) || {}
  let originalData = data

  for (let i = 0; i < keys.length - 1; i++) {
    if (data[keys[i]] === undefined) {
      data[keys[i]] = {}
    }
    data = data[keys[i]]
  }

  data[keys[keys.length - 1]] = value
  localStorage.setItem(localStorageKey(), JSON.stringify(originalData))
  return originalData
}

/**
 *
 * @param {string} path
 *  Example: "<zipcode>.<bedrooms>.<forSale/sold/rent>"
 * @returns {any}
 */
function getLocalREIData(path) {
  let keys = path.split('.')
  let data = JSON.parse(localStorage.getItem(localStorageKey())) || {}

  for (let i = 0; i < keys.length; i++) {
    if (data[keys[i]] === undefined) {
      return undefined
    }
    data = data[keys[i]]
  }

  return data
}

function resetREIData() {
  localStorage.setItem(localStorageKey(), JSON.stringify({}))
}

function localStorageKey() {
    return 'rei'
}
