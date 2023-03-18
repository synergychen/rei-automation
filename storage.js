class Storage {
  constructor(key = 'rei') {
    this.key = key
  }

  /**
   *
   * @param {string} path
   *  Example: "<zipcode>.<bedrooms>.<forSale/sold/rent>"
   * @param {any} value
   *  Example: { average: 100, median: 90 }
   * @returns {any}
   */
  set(path, value) {
    let keys = path.split('.')
    let data = JSON.parse(localStorage.getItem(this.key)) || {}
    let originalData = data

    for (let i = 0; i < keys.length - 1; i++) {
      if (data[keys[i]] === undefined) {
        data[keys[i]] = {}
      }
      data = data[keys[i]]
    }

    data[keys[keys.length - 1]] = value
    localStorage.setItem(this.key, JSON.stringify(originalData))
    return originalData
  }

  /**
   *
   * @param {string} path
   *  Example: "<zipcode>.<bedrooms>.<forSale/sold/rent>"
   * @returns {any}
   */
  get(path) {
    let keys = path.split('.')
    let data = JSON.parse(localStorage.getItem(this.key)) || {}

    for (let i = 0; i < keys.length; i++) {
      if (data[keys[i]] === undefined) {
        return undefined
      }
      data = data[keys[i]]
    }

    return data
  }

  get root() {
    return JSON.parse(localStorage.getItem(this.key))
  }

  reset() {
    localStorage.setItem(this.key, JSON.stringify({}))
  }
}
