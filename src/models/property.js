const { PROPERTY_ATTRIBTUES } = require('../utils/constants.js')

class Property {
  static TWO_BEDS_MEDIAN_SIZE = 1300
  static THREE_BEDS_MEDIAN_SIZE = 1600
  static FOUR_BEDS_MEDIAN_SIZE = 1900

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
    schoolScores = [],
    priceHistory = []
  } = {}) {
    // Set variables
    for (const variable of PROPERTY_ATTRIBTUES) {
      this[variable] = arguments[0][variable]
    }

    this.update()
  }

  get valid() {
    return (
      this.address.length > 5 &&
      this.bedrooms > 0 &&
      this.price > 0 &&
      this.sqft > 0
    )
  }

  // Average house size for different bedrooms
  // - 2-bedroom: 1,300
  // - 3-bedroom: 1,600
  // - 4-bedroom: 1,900
  get isLargeSize() {
    switch (this.bedrooms) {
      case 2:
        if (this.sqft >= Property.THREE_BEDS_MEDIAN_SIZE) return true
        break
      case 3:
        if (this.sqft >= Property.FOUR_BEDS_MEDIAN_SIZE) return true
        break
      case 4:
        if (this.sqft >= Property.FOUR_BEDS_MEDIAN_SIZE + 300) return true
        break
      default:
        break
    }
    return false
  }

  get isSmallSize() {
    switch (this.bedrooms) {
      case 2:
        if (this.sqft < Property.TWO_BEDS_MEDIAN_SIZE - 300) return true
        break
      case 3:
        if (this.sqft < Property.TWO_BEDS_MEDIAN_SIZE) return true
        break
      case 4:
        if (this.sqft < Property.THREE_BEDS_MEDIAN_SIZE) return true
        break
      default:
        break
    }
    return false
  }

  get hasGoodSchool() {
    return this.schoolScores.some((score) => score >= 7)
  }

  get goodSchoolsCount() {
    return this.schoolScores.filter((score) => score >= 7).length
  }

  get allBadSchools() {
    return this.schoolScores.every((score) => score <= 4)
  }

  get priceIncreases() {
    return this.priceHistory.filter((record) => {
      return record.percentChange > 0
    })
  }

  get priceDecreases() {
    return this.priceHistory.filter((record) => {
      return record.percentChange < 0
    })
  }

  get totalPriceIncrease() {
    return this.priceIncreases.reduce(
      (total, { percentChange }) => total + percentChange,
      0
    )
  }

  get totalPriceDecrease() {
    const total = this.priceDecreases.reduce(
      (total, { percentChange }) => total + percentChange,
      0
    )
    return parseFloat(total.toFixed(2))
  }

  update() {
    const { city, state, zipcode } = this.parseAddress()
    this.city = city
    this.state = state
    this.zipcode = this.zipcode || zipcode
  }

  parseAddress() {
    if (!this.address) return {}
    try {
      const parts = this.address.split(',').map((e) => e.trim())
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
}

module.exports = { Property }
