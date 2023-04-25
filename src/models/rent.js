class Rent {
  static RENTOMETER = 'Rentometer'
  static BIGGER_POCKETS = 'BiggerPockets'
  static ZILLOW = 'Zestimate'

  constructor({
    address = null,
    zipcode = null,
    average = null,
    median = null,
    pct25th = null,
    pct75th = null,
    count = null,
    source = null
  } = {}) {
    this.address = address
    this.zipcode = zipcode
    this.average = average
    this.median = median
    this.pct25th = pct25th
    this.pct75th = pct75th
    this.count = count
    this.source = source
  }

  get key() {
    if (this.zipcode && !this.address) {
      return `${this.zipcode}|${this.source}`
    } else if (!this.zipcode && this.address) {
      return `${this.address}|${this.source}`
    }
  }

  get hasBiggerPockets() {
    return this.source === Rent.BIGGER_POCKETS
  }

  get hasRentometer() {
    return this.source === Rent.RENTOMETER
  }

  setRentometer() {
    this.source = Rent.RENTOMETER
  }

  setBiggerPockets() {
    this.source = Rent.BIGGER_POCKETS
  }

  setZillow() {
    this.source = Rent.ZILLOW
  }
}

module.exports = { Rent }
