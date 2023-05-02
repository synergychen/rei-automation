const { PROPERTY_ATTRIBTUES, STATUS } = require('../utils/constants.js')
const { Rent } = require('./rent.js')

class Property {
  static TWO_BEDS_MEDIAN_SIZE = 1300
  static THREE_BEDS_MEDIAN_SIZE = 1600
  static FOUR_BEDS_MEDIAN_SIZE = 1900
  static FOR_SALE = 'FOR_SALE'

  constructor(props = {}) {
    // Set variables
    for (const variable of PROPERTY_ATTRIBTUES) {
      this[variable] = props[variable] ?? null
    }

    this.rents ||= []
    this.rents = this.rents.map((rent) => new Rent(rent))
    this.schoolScores ||= []
    this.priceHistory ||= []
    this.status ||= STATUS.default

    this.update()
  }

  get valid() {
    const validData =
      this.address &&
      this.address.length > 5 &&
      this.bedrooms > 0 &&
      this.price > 0 &&
      this.sqft > 0
    const validStatus = (this.homeStatus ? this.homeStatus === Property.FOR_SALE : true)
    return validData && validStatus
  }

  get missingStatus() {
    return !this.homeStatus
  }

  get onMarket() {
    return this.homeStatus == "FOR_SALE"
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

  /**
   * Status
   */
  get toBeAnalyzed() {
    return this.status === STATUS.default
  }

  get isAnalyzed() {
    return this.status !== STATUS.default
  }

  get isDeal() {
    return this.status === STATUS.deal
  }

  get isInterested() {
    return this.status === STATUS.isInterested
  }

  setDeal() {
    this.status = STATUS.deal
  }

  setNotADeal() {
    this.status = STATUS.notADeal
  }

  setInterested() {
    this.status = STATUS.interested
  }

  setNotInterested() {
    this.status = STATUS.notInterested
  }

  setOffer() {
    this.status = STATUS.offer
  }

  /**
   * Deal
   */
  getDeal(percentThreshold = 0.7) {
    const deal = new Deal({
      property: this,
      percentThreshold
    })
    return deal
  }

  update() {
    // Update city, state, zipcode
    const { city, state, zipcode } = this.parseAddress()
    this.city = city
    this.state = state
    this.zipcode = this.zipcode || zipcode
    // Update status
    const deal = this.getDeal()
    if (this.valid && this.toBeAnalyzed && deal.isReady()) {
      if (deal.isGood()) {
        this.setDeal()
      } else {
        this.setNotADeal()
      }
    }
    // Timestamp
    this.updatedAt = new Date()
      .toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '')
  }

  updateRent(rent) {
    rent = new Rent(rent)
    const index = this.rents.findIndex((e) => e.source === rent.source)
    if (index !== -1) {
      // Update when source found
      this.rents[index] = rent
    } else {
      // Append when source not found
      this.rents.push(rent)
    }
    this.update()
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
