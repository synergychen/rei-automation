const { PROPERTY_ATTRIBTUES } = require('../constants.js')
const { Property } = require('../../models/property.js')
const { matchedText, matchedTexts, serializeAddress } = require('../helpers.js')

class HomeDetailsParser {
  static parse() {
    const parser = new HomeDetailsParser()
    return new Property(parser.summary)
  }

  get summary() {
    const summary = {}
    PROPERTY_ATTRIBTUES.forEach((property) => {
      summary[property] = this[property]
    })
    return summary
  }

  get property() {}

  get address() {
    return serializeAddress(
      document.querySelector('.summary-container h1').innerText
    )
  }

  get zipcode() {
    const matched = (this.address || '').match(/\d{5}$/)
    return matched ? matched[0] : 'N/A'
  }

  get price() {
    return this.parseValue(
      document.querySelector(".summary-container [data-testid='price']")
        .innerText
    )
  }

  get bedrooms() {
    const matched = matchedTexts('[data-testid="bed-bath-beyond"]', /(\d) bd/)
    return matched ? parseInt(matched[1]) : -1
  }

  get bathrooms() {
    const matched = matchedTexts('[data-testid="bed-bath-beyond"]', /(\d) ba/)
    return matched ? parseInt(matched[1]) : -1
  }

  get yearBuilt() {
    const matched = matchedTexts('.ds-data-view-list', /built in (\d{4})/i)
    return matched ? parseInt(matched[1]) : -1
  }

  get sqft() {
    const matched = matchedTexts(
      '[data-testid="bed-bath-beyond"]',
      /([\d|,]{2,7}) sqft/
    )
    return matched ? this.parseValue(matched[1]) : -1
  }

  get propertyTaxes() {
    const matched = matchedText(
      '.ds-data-view-list',
      /property taxes \$([\d|,]+)/i
    )
    return matched ? this.parseValue(matched[1]) : -1
  }

  get daysOnMarket() {
    const matched = matchedText(
      '.ds-data-view-list',
      /([\d|,]+) days? on zillow/i
    )
    return matched ? this.parseValue(matched[1]) : -1
  }

  get homeType() {
    const matched = matchedTexts(
      '.data-view-container',
      /single family residence|townhouse|triplex|duplex/gi
    )
    return matched ? matched[0] : 'N/A'
  }

  get schoolScores() {
    return matchedTexts('#ds-nearby-schools-list', /\d{1,2}\/10/g).map((e) =>
      parseInt(e.replace(/\/10/, ''))
    )
  }

  get priceHistory() {
    const history = [
      ...document.querySelectorAll('.data-view-container li table tr')
    ].map((tr) => tr.innerText.replace(/\t|\n/g, ' '))
    return this.findPriceChanges(history, this.daysOnMarket)
  }

  parseValue(dollarAmount) {
    return parseInt(dollarAmount.replace(/\$|,/g, ''))
  }

  findPriceChanges(rows, nDays) {
    const today = new Date()
    const timeThreshold = today.getTime() - nDays * 24 * 60 * 60 * 1000
    const priceChangeRegex = /Price change\s+.*?\$(\d[\d,]*)\s+(-?\d*\.?\d*)%/
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/
    const priceChanges = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.includes('Price change')) continue

      const dateMatch = row.match(dateRegex)
      if (!dateMatch) continue

      const date = new Date(dateMatch[0])
      if (date.getTime() < timeThreshold) continue

      const priceMatch = row.match(priceChangeRegex)
      if (!priceMatch) continue

      const price = parseInt(priceMatch[1].replace(/,/g, ''))
      const percentChange = parseFloat(priceMatch[2])
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
      priceChanges.push({ date: formattedDate, price, percentChange })
    }

    return priceChanges
  }
}

module.exports = { HomeDetailsParser }
