class Property {
  // Define accessors dynamically based on a list of variables
  static variables = [
    'address',
    'city',
    'state',
    'zipcode',
    'homeType',
    'price',
    'bedrooms',
    'bathrooms',
    'yearBuilt',
    'sqft',
    'daysOnMarket',
    'propertyTaxes',
    'estimatedRent',
    'estimatedRentToPrice'
  ]

  constructor({
    address = null,
    city = null,
    state = null,
    zipcode = null,
    homeType = null,
    price = null,
    bedrooms = null,
    bathrooms = null,
    yearBuilt = null,
    sqft = null,
    daysOnMarket = null,
    propertyTaxes = null,
    estimatedRent = null,
    estimatedRentToPrice = null
  } = {}) {
    // Set variables
    for (const variable of Property.variables) {
      this['_' + variable] = eval(variable)
      Object.defineProperty(this, variable, {
        get() {
          return this[`_${variable}`]
        },
        set(value) {
          this[`_${variable}`] = value
        }
      })
    }
  }

  get valid() {
    return this.address.length > 5 && this.bedrooms > 0 && this.price > 0
  }

  update() {
    this._estimatedRentToPrice = this.rentToPrice()
    const { city, state, zipcode } = this.parseAddress()
    this._city = city
    this._state = state
    this._zipcode = this._zipcode || zipcode
  }

  toJSON() {
    const jsonObj = {}
    for (const key in this) {
      if (key.startsWith('_')) {
        jsonObj[key.substring(1)] = this[key]
      }
    }
    return jsonObj
  }

  get estimatedRentToPricePercent() {
    return parseFloat((this.estimatedRentToPrice * 100).toFixed(2))
  }

  rentToPrice() {
    if (this.estimatedRent <= 0 || this.price <= 0) return -1
    return this.estimatedRent / this.price
  }

  parseAddress() {
    if (!this._address) return {}
    try {
      const parts = this._address.split(',').map((e) => e.trim())
      const city = parts && parts[1]
      const matchedZipcode = parts[2].match(/\d{5}$/)
      const zipcode = matchedZipcode && matchedZipcode[0]
      const matchedState = parts[2].match(/\w{2}/)
      const state = matchedState && matchedState[0]
      return { city, state, zipcode }
    } catch (error) {
      console.log(error)
      return {}
    }
  }

  isGoodDeal(percentThreshold = 0.7) {
    if (this.rentToPrice() < 0) return
    return this.rentToPrice() >= percentThreshold / 100
  }
}

module.exports = { Property }
