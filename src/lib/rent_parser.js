class RentParser {
  constructor() {
    this.parse()
  }

  parse() {
    this.zipcode = this.parseZipcode()
    this.bedrooms = this.parseBedrooms()
    this.average = this.parseAverage()
    this.median = this.parseMedian()
    this.pct25th = this.parse25th()
    this.pct75th = this.parse75th()
    this.dataPoints = this.parseDataPoints()
  }

  summary() {
    const selectedTab = document
      .querySelector('.search-type-tab.active a')
      .innerText.trim()
    if (selectedTab.match(/zip code/i)) {
      return this.summaryForZipcode()
    } else if (selectedTab.match(/address/i)) {
      return this.summaryForAddress()
    }
    return {}
  }

  summaryCsvData() {
    const summary = this.summary()
    return [
      [
        summary.zipcode,
        summary.bedrooms,
        summary.average,
        summary.median,
        summary['25th'],
        summary['75th'],
        summary.data_points
      ]
    ]
  }

  summaryForAddress() {
    return {
      address: this.address,
      bedrooms: this.bedrooms,
      average: this.average,
      median: this.average,
      '25th': this.pct25th,
      '75th': this.pct75th,
      data_points: this.dataPoints
    }
  }

  summaryForZipcode() {
    return {
      zipcode: this.zipcode,
      bedrooms: this.bedrooms,
      average: this.average,
      median: this.average,
      '25th': this.pct25th,
      '75th': this.pct75th,
      data_points: this.dataPoints
    }
  }

  parseZipcode() {
    const resultText = document
      .querySelector('h3.result-address-header')
      .innerText.replace(/quickview/i, '')
      .trim()
      .match(/\d{5}$/)
    return resultText && resultText[0]
  }

  parseBedrooms() {
    return parseInt(
      document.querySelector('select#zip_unified_search_bed_style').value
    )
  }

  parseAverage() {
    return this.parseValue(
      document.querySelector("[title='Sample Mean']").innerText
    )
  }

  parseMedian() {
    return this.parseValue(
      document.querySelector("[title='Sample Median']").innerText
    )
  }

  parse25th() {
    return this.parseValue(
      document.querySelector(
        "[title^='This is the estimated value of the 25th']"
      ).innerText
    )
  }

  parse75th() {
    return this.parseValue(
      document.querySelector(
        "[title^='This is the estimated value of the 75th']"
      ).innerText
    )
  }

  parseDataPoints() {
    const summary = document
      .querySelector('#active-results-container')
      .innerText.replaceAll('\n', '')
      .match(/Results based on (\d+), .* within (\d+) months/)
    return parseInt(summary[1])
  }

  parseValue(priceStr) {
    return parseInt(priceStr.replaceAll('$', '').replaceAll(',', ''))
  }
}

module.exports = { RentParser }
