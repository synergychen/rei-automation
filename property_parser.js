class PropertyParser {
  constructor() {}

  get summary() {
    return {
      address: this.address,
      zipcode: this.zipcode,
      price: this.price,
      bedrooms: this.bedrooms,
      bathrooms: this.bathrooms,
      livingSize: this.livingSize,
      homeType: this.homeType
    }
  }

  get zipcode() {}

  get address() {}

  get price() {}

  get bedrooms() {}

  get bathrooms() {}

  get livingSize() {}

  get homeType() {}

  parseValue(dollarAmount) {
    return parseInt(dollarAmount.replace(/\$|,/g, ''))
  }
}

class ZillowPropertyParser extends PropertyParser {
  get address() {
    return document.querySelector('.summary-container h1').textContent
  }

  get zipcode() {
    const matched = (this.address || '').match(/\d{5}$/)
    return matched ? matched[0] : 'N/A'
  }

  get price() {
    return this.parseValue(
      document.querySelector(".summary-container [data-testid='price']")
        .textContent
    )
  }

  get bedrooms() {
    const matched = document
      .querySelector('[data-testid="bed-bath-beyond"]')
      .textContent.match(/(\d) bd/)
    return matched ? parseInt(matched[1]) : -1
  }

  get bathrooms() {
    const matched = document
      .querySelector('[data-testid="bed-bath-beyond"]')
      .textContent.match(/(\d) ba/)
    return matched ? parseInt(matched[1]) : -1
  }

  get livingSize() {
    const matched = document
      .querySelector('[data-testid="bed-bath-beyond"]')
      .textContent.match(/([\d|,]{4,7}) sqft/)
    return matched ? this.parseValue(matched[1]) : -1
  }

  get homeType() {
    const matched = document
      .querySelector('.data-view-container')
      .innerText.match(/single family residence|townhouse/gi)
    return matched ? matched[0] : 'N/A'
  }
}
