const { Rent } = require('../../models/rent.js')
const { average, median, pct25th, pct75th } = require('../helpers.js')

class RentParser {
  constructor(target = document) {
    this.target = target
    return new Rent({
      address: this.address,
      zipcode: this.zipcode,
      bedrooms: this.bedrooms,
      average: this.average,
      median: this.median,
      pct25th: this.pct25th,
      pct75th: this.pct75th,
      count: this.count,
      source: null
    })
  }

  static parse(target = document) {}

  get address() {}

  get zipcode() {}

  get bedrooms() {}

  get average() {}

  get median() {}

  get pct25th() {}

  get pct75th() {}

  get count() {}

  parseValue(priceStr) {
    return parseInt(priceStr.replaceAll('$', '').replaceAll(',', ''))
  }
}

class RentometerRentParser extends RentParser {
  static parse(target = document) {
    const rent = new RentometerRentParser(target)
    rent.setRentometer()
    return rent
  }

  get address() {
    if (this.useAddress()) {
      return this.target
        .querySelector('#address_unified_search_address')
        .value.replace(/, USA$/, '')
    }
    return null
  }

  get zipcode() {
    if (this.useZipcode()) {
      const resultText = this.target
        .querySelector('h3.result-address-header')
        .innerText.replace(/quickview/i, '')
        .trim()
        .match(/\d{5}$/)
      return resultText && resultText[0]
    }
    return null
  }

  get bedrooms() {
    return parseInt(
      this.target.querySelector('select#zip_unified_search_bed_style').value
    )
  }

  get average() {
    return this.parseValue(
      this.target.querySelector("[title='Sample Mean']").innerText
    )
  }

  get median() {
    return this.parseValue(
      this.target.querySelector("[title='Sample Median']").innerText
    )
  }

  get pct25th() {
    return this.parseValue(
      this.target.querySelector(
        "[title^='This is the estimated value of the 25th']"
      ).innerText
    )
  }

  get pct75th() {
    return this.parseValue(
      this.target.querySelector(
        "[title^='This is the estimated value of the 75th']"
      ).innerText
    )
  }

  get count() {
    const summary = this.target
      .querySelector('#active-results-container')
      .innerText.replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .match(/Results based on (\d+), .* within (\d+) months/)
    return parseInt(summary[1])
  }

  useAddress() {
    const selectedTab = this.target
      .querySelector('.search-type-tab.active a')
      .innerText.trim()
    return !!selectedTab.match(/address/i)
  }

  useZipcode() {
    const selectedTab = this.target
      .querySelector('.search-type-tab.active a')
      .innerText.trim()
    return !!selectedTab.match(/zip code/i)
  }
}

class BiggerPocketsRentParser extends RentParser {
  static parse(target = document) {
    const rent = new BiggerPocketsRentParser(target)
    rent.setBiggerPockets()
    return rent
  }

  get address() {
    // Zip code
    if (this.addressText && this.addressText.length === 5) return null
    return this.addressText
  }

  get zipcode() {
    return this.addressText && this.addressText.length === 5
      ? this.addressText
      : null
  }

  get bedrooms() {
    const el = this.target.querySelector(
      '[name="validated_address_search[beds]"]'
    )
    return el && parseInt(el.value)
  }

  get average() {
    return parseInt(average(this.rents))
  }

  get median() {
    return parseInt(median(this.rents))
  }

  get pct25th() {
    return parseInt(pct25th(this.rents))
  }

  get pct75th() {
    return parseInt(pct75th(this.rents))
  }

  get count() {
    return this.rents.length
  }

  get rents() {
    const el = this.target.querySelector(
      '.insights-result-comparable-properties-list-content'
    )
    if (!el) return null
    return el.innerText
      .match(/\$\d{1,3}(?:,\d{3})*(\.\d+)?/g)
      .map((e) => this.parseValue(e))
  }

  get addressText() {
    const el = this.target.querySelector('.insights-result-title')
    return el && el.innerText.replace(/\n/g, ' ').trim()
  }
}

class ZillowRentParser extends RentParser {
  static parse(target = document) {
    const rent = new ZillowRentParser(target)
    rent.setZillow()
    return rent
  }

  get address() {}

  get zipcode() {}

  get bedrooms() {}

  get average() {}

  get median() {}

  get pct25th() {}

  get pct75th() {}

  get count() {}
}

module.exports = {
  RentParser,
  RentometerRentParser,
  BiggerPocketsRentParser,
  ZillowRentParser
}
