const { Property } = require('./property.js')
const { Rent } = require('./rent.js')

class Deal {
  static RENT_TO_PRICE_PERCENT_THRESHOLD = 0.7

  constructor({
    property,
    rents = [],
    percentThreshold = Deal.RENT_TO_PRICE_PERCENT_THRESHOLD
  }) {
    this.property = new Property(property)
    this.rents = rents.map(rent => new Rent(rent))
    this.percentThreshold = percentThreshold
  }

  isGood() {
    for (const rent of this.rents) {
      if (this._isGood(rent, this.property)) {
        return true
      }
    }
    return false
  }

  _isGood(rent, property) {
    if (this._rentToPrice(rent, property) < 0) return
    return this._rentToPrice(rent, property) >= this.percentThreshold / 100
  }

  _rentToPrice(rent, property) {
    if (rent.median <= 0 || property.price <= 0) return -1
    return rent.median / property.price
  }
}

module.exports = { Deal }
