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

  reset() {
    localStorage.setItem(this.key, JSON.stringify({}))
  }

  resetVisited() {
    this.set('visited', {})
  }

  resetInterested() {
    this.set('interested', {})
  }

  get root() {
    return JSON.parse(localStorage.getItem(this.key))
  }

  get visited() {
    return this.root['visited'] || {}
  }

  get interested() {
    return this.root['interested'] || {}
  }

  find(address) {
    return this.visited[this._sanitalize(address)]
  }

  isVisited(address) {
    return this.visited.hasOwnProperty(this._sanitalize(address))
  }

  isInterested(address) {
    return this.interested.hasOwnProperty(this._sanitalize(address))
  }

  visit(property) {
    const visited = this.visited
    visited[this._sanitalize(property.address)] = property
    this.set(`visited`, visited)
    console.log(visited)
  }

  interest(address) {
    const interested = this.interested
    interested[this._sanitalize(address)] = true
    this.set(`interested`, interested)
    console.log(interested)
  }

  uninterest(address) {
    const interested = this.interested
    delete interested[this._sanitalize(address)]
    this.set(`interested`, interested)
    console.log(interested)
  }

  _sanitalize(address) {
    return address.replace(/\u00A0/g, ' ')
  }
}
