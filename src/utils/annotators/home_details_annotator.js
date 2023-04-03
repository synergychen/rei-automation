const { Storage } = require('../../db/storage.js')
const { Renderer } = require('../renderer.js')
const { COLORS } = require('../constants.js')
const { rentToPrice, toPercent } = require('../helpers.js')
const { currentProperty } = require('../session.js')

class HomeDetailsAnnotator {
  constructor(storage) {
    this.storage = storage
  }

  static async annotate() {
    const storage = await Storage.create()
    const annotator = new HomeDetailsAnnotator(storage)
    await annotator.annotate()
  }

  async annotate() {
    // Add link to address
    this.annotateAddress()
    // Add summary detail
    await this.renderHomeSummary()
    // Add BP rent calculator link
    await this.renderBPRentCalculatorLink()
    // Add "Interested" button
    await this.renderInterestedButton()
    // Render chips
    this.renderChips()
  }

  async renderChips() {
    await this.addChipsContainer()
    // Add price changes
    await this.renderPriceChanges()
    // Add days on market: 30 / 60 / 90 / 180 / 270 / 360
    await this.renderDaysOnMarketChip()
    // Add size: large or small
    await this.renderSizeChip()
    // Add school rating
    await this.renderSchoolChip()
  }

  async renderHomeSummary() {
    const property = currentProperty()
    const rents = await this.storage.findRents(property.address)
    if (property && rents.length > 0) {
      const obj = {
        Year: property.yearBuilt,
        'Days on Market': property.daysOnMarket
      }
      rents.forEach((rent) => {
        obj['Rent / ' + rent.source] = rent.median
        obj['Ratio / ' + rent.source] = toPercent(
          rentToPrice(rent.median, property.price)
        )
      })
      Renderer.render(obj)
    } else {
      console.log('No analysis done for this property')
    }
  }

  async renderInterestedButton() {
    const interestedButtonId = 'interested-button'
    if (document.querySelector('#' + interestedButtonId)) return

    const interestedButton = document.createElement('button')
    interestedButton.setAttribute('id', interestedButtonId)

    const markAsInterested = async () => {
      interestedButton.innerText = 'Interested'
      interestedButton.style.cssText = `background-color: ${COLORS.green}; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: none; padding: 5px 10px`
      await this.storage.interest(this.getAddress())
      isInterested = true
    }

    const markAsUninterested = async () => {
      interestedButton.innerText = 'Interested?'
      interestedButton.style.cssText =
        'background-color: white; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: 1px solid; padding: 5px 10px'
      await this.storage.uninterest(this.getAddress())
      isInterested = false
    }

    let isInterested = await this.storage.isInterested(this.getAddress())
    const buttonLabel = isInterested ? 'Interested' : 'Interested?'
    const buttonStyle = isInterested
      ? `background-color: ${COLORS.green}; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: 1px solid ${COLORS.green}; padding: 5px 10px`
      : 'background-color: white; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: 1px solid; padding: 5px 10px'

    interestedButton.innerText = buttonLabel
    interestedButton.style.cssText = buttonStyle

    interestedButton.addEventListener('click', async () => {
      if (isInterested) {
        await markAsUninterested()
      } else {
        await markAsInterested()
      }
    })

    const summaryContainer = document.querySelector('.summary-container')
    const targetElement = summaryContainer.querySelector(
      '[data-renderstrat="inline"]'
    )
    targetElement.insertAdjacentElement('afterend', interestedButton)
  }

  async renderPriceChanges() {
    const chipClassName = 'price-change-chip'
    if (document.querySelector('.' + chipClassName)) return

    const property = currentProperty()
    if (property.priceIncreases.length > 0) {
      this.addChip(
        chipClassName,
        `Price Increase: ${property.totalPriceIncrease}% (${property.priceIncreases.length})`,
        COLORS.lightRed,
        COLORS.red
      )
    }
    if (property.priceDecreases.length > 0) {
      this.addChip(
        chipClassName,
        `Price Cut: ${property.totalPriceDecrease}% (${property.priceDecreases.length})`,
        COLORS.lightGreen,
        COLORS.green
      )
    }
  }

  async renderDaysOnMarketChip() {
    const chipClassName = 'days-on-market-chip'
    if (document.querySelector('.' + chipClassName)) return

    const property = currentProperty()
    const step = 30
    const daysOnMarket =
      property.daysOnMarket > 0
        ? Math.floor(property.daysOnMarket / step) * step
        : -1
    if (daysOnMarket >= step * 2) {
      this.addChip(
        chipClassName,
        `DOM: ${daysOnMarket}+`,
        COLORS.lightGreen,
        COLORS.green
      )
    } else if (daysOnMarket >= step) {
      this.addChip(
        chipClassName,
        `DOM: ${daysOnMarket}+`,
        COLORS.lightYellow,
        COLORS.yellow
      )
    } else {
      this.addChip(chipClassName, `DOM < 30`, COLORS.lightRed, COLORS.red)
    }
  }

  async renderSizeChip() {
    const chipClassName = 'size-chip'
    if (document.querySelector('.' + chipClassName)) return

    const property = currentProperty()
    if (property.sqft < 0) return

    if (property.isLargeSize) {
      this.addChip(chipClassName, 'Size: L', COLORS.lightGreen, COLORS.green)
    } else if (property.isSmallSize) {
      this.addChip(chipClassName, 'Size: S', COLORS.lightRed, COLORS.red)
    } else {
      this.addChip(chipClassName, 'Size: M', COLORS.lightGray, COLORS.gray)
    }
  }

  async renderSchoolChip() {
    const chipClassName = 'school-chip'
    if (document.querySelector('.' + chipClassName)) return

    const property = currentProperty()
    if (property.hasGoodSchool) {
      this.addChip(chipClassName, `SCH: Good (${property.goodSchoolsCount})`, COLORS.lightGreen, COLORS.green)
    } else if (property.allBadSchools) {
      this.addChip(chipClassName, 'SCH: Bad', COLORS.lightRed, COLORS.red)
    }
  }

  async renderBPRentCalculatorLink() {
    const property = currentProperty()
    if (!property) return
    const link = `https://www.biggerpockets.com/insights/locations?validated_address_search%5Baddress%5D=${property.address}+++&validated_address_search%5Bstructure_type%5D=&validated_address_search%5Bbeds%5D=${property.bedrooms}&validated_address_search%5Bbaths%5D=${property.bathrooms}&adjust_details=true&commit=Adjust+details`
    const linkId = 'bp-rent-calculator'

    this.addLink(linkId, link)
  }

  addLink(linkId, link) {
    if (document.querySelector('#' + linkId)) return
    const el = document.createElement('a')
    el.href = link
    el.target = '_blank'
    el.innerText = 'BP Rent'
    el.style.cssText =
      'border: 1px solid; border-radius: 5px; padding: 6px 10px; margin-left: 15px;'

    const summaryContainer = document.querySelector('.summary-container')
    const targetElement = summaryContainer.querySelector(
      '[data-renderstrat="inline"]'
    )
    targetElement.insertAdjacentElement('afterend', el)
  }

  addChip(className, text, bgColor, borderColor) {
    const el = document.createElement('div')
    el.innerText = text
    el.classList.add(className)
    el.style.cssText = `border: 1px solid ${borderColor}; border-radius: 5px; padding: 3px 5px; margin-left: 15px; background-color: ${bgColor};align-items: center; display: flex; height: 30px; margin-top: 10px;`

    this.getChipsContainer().appendChild(el)
  }

  addChipsContainer() {
    const id = 'chips-container'
    if (document.querySelector('#' + id)) return

    const el = document.createElement('div')
    el.setAttribute('id', id)
    el.style.cssText = 'display: flex; flex-wrap: wrap; margin-top: 5px;'
    const summaryContainer = document.querySelector('.summary-container')
    const targetElement = summaryContainer.querySelector(
      '[data-renderstrat="inline"]'
    )
    targetElement.insertAdjacentElement('afterend', el)
  }

  getChipsContainer() {
    return document.querySelector('#chips-container')
  }

  /**
   * Add Google map link to address
   */
  annotateAddress() {
    // Select the h1 element with the address
    const addressElement = document.querySelector('.summary-container h1')
    // Get the address text
    const addressText = addressElement.innerText
    // Create a new a element for the link
    const link = document.createElement('a')
    // Set the href attribute to the Google Maps URL with the address
    link.href = `https://www.google.com/maps?q=${encodeURIComponent(
      addressText
    )}`
    // Set the target attribute to _blank to open the link in a new tab
    link.target = '_blank'
    // Set the link text to the address
    link.innerText = addressText
    // Replace the h1 content with the link
    addressElement.innerHTML = ''
    addressElement.appendChild(link)
  }

  getAddress() {
    // Select the h1 element with the address
    const addressElement = document.querySelector('.summary-container h1')
    // Get the address text
    return addressElement.innerText
  }

  getElementById(zillowId) {
    return [...document.querySelectorAll('.' + mapDotClassName)].find((el) => {
      const propsName = Object.getOwnPropertyNames(el).find((e) =>
        e.startsWith('__reactInternalInstance')
      )
      const id = el[propsName].return.return.key
      if (id === zillowId) {
        console.log('FOUND')
        return el
      }
    })
  }
}

module.exports = { HomeDetailsAnnotator }
