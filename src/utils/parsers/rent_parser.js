const { Rent } = require('../../models/rent.js')

class RentParser {
  constructor() {
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

  static parse() {}

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
  static parse() {
    const rent = new RentometerRentParser()
    rent.setRentometer()
    return rent
  }

  get address() {
    if (this.useAddress()) {
      return document.querySelector('#address_unified_search_address').value
    }
    return null
  }

  get zipcode() {
    if (this.useZipcode()) {
      const resultText = document
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
      document.querySelector('select#zip_unified_search_bed_style').value
    )
  }

  get average() {
    return this.parseValue(
      document.querySelector("[title='Sample Mean']").innerText
    )
  }

  get median() {
    return this.parseValue(
      document.querySelector("[title='Sample Median']").innerText
    )
  }

  get pct25th() {
    return this.parseValue(
      document.querySelector(
        "[title^='This is the estimated value of the 25th']"
      ).innerText
    )
  }

  get pct75th() {
    return this.parseValue(
      document.querySelector(
        "[title^='This is the estimated value of the 75th']"
      ).innerText
    )
  }

  get count() {
    const summary = document
      .querySelector('#active-results-container')
      .innerText.replaceAll('\n', '')
      .match(/Results based on (\d+), .* within (\d+) months/)
    return parseInt(summary[1])
  }

  useAddress() {
    const selectedTab = document
      .querySelector('.search-type-tab.active a')
      .innerText.trim()
    return !!selectedTab.match(/address/i)
  }

  useZipcode() {
    const selectedTab = document
      .querySelector('.search-type-tab.active a')
      .innerText.trim()
    return !!selectedTab.match(/zip code/i)
  }
}

class BiggerPocketsRentParser extends RentParser {
  static parse() {
    const rent = new BiggerPocketsRentParser()
    rent.setBiggerPockets()
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

class ZillowRentParser extends RentParser {
  static parse() {
    const rent = new ZillowRentParser()
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
