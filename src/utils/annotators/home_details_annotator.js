const { DataAPI } = require('../../db/data_api.js')
const { Renderer } = require('../renderer.js')
const { COLORS, STATUS } = require('../constants.js')
const {
  rentToPrice,
  toPercent,
  findElementUntil,
  encodeUrlParams
} = require('../helpers.js')
const { currentProperty } = require('../session.js')
const { PropertyAnalyzer } = require('../analyzers/property_analyzer.js')

class HomeDetailsAnnotator {
  constructor() {
    this.dataApi = new DataAPI()
    this.property = null
  }

  static async annotate() {
    const annotator = new HomeDetailsAnnotator()
    annotator.property = await currentProperty()

    if (!annotator.property) {
      console.log('Current property not exists')
      return
    }

    await annotator.annotate()
  }

  async annotate() {
    // Add link to address
    this.annotateAddress()
    // Add summary detail
    await this.renderHomeSummary()
    // Render status select
    this.renderSelects()
    // Render links
    await this.renderLinks()
    // Render chips
    await this.renderChips()
  }

  renderSelects() {
    this.addContainer('selects-container')
    this.renderStatusSelect()
  }

  async renderLinks() {
    this.addContainer('links-container')
    if (!this.property.isAnalyzed) {
      // Add "Analyze" link
      this.renderAnalyzeLink()
    }
    // Add Rentometer link
    await this.renderRentometerLink()
    // Add BP rent calculator link
    await this.renderBPRentLink()
    // Add lot lines
    await this.renderLotLines()
  }

  async renderChips() {
    this.addContainer('chips-container')
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
    const rents = this.property.rents
    if (this.property && rents.length > 0) {
      const obj = {
        Year: this.property.yearBuilt,
      }
      rents.forEach((rent) => {
        obj['Rent / ' + rent.source] = rent.median
        obj['Ratio / ' + rent.source] = toPercent(
          rentToPrice(rent.median, this.property.price)
        )
      })
      Renderer.render(obj)
    } else {
      console.log('No analysis done for this property')
    }
  }

  renderStatusSelect() {
    const select = document.createElement('select')

    for (const status of Object.values(STATUS)) {
      const option = document.createElement('option')
      option.text = status
      if (status === this.property.status) {
        option.selected = true
        if (status === STATUS.notADeal) {
          select.disabled = true
        }
      }
      select.appendChild(option)
    }

    select.addEventListener('change', async (event) => {
      this.property.status = event.target.value
      await this.dataApi.updateProperty(this.property)
    })

    const targetElement = document.getElementById('selects-container')
    select.style.cssText = `margin: 0 15px; border-radius: 5px; width: 150px; height: 35px;`
    targetElement.appendChild(select)
  }

  renderAnalyzeLink() {
    const element = this.addLink('Analyze')
    element.href = '#'
    element.onclick = async () => {
      await PropertyAnalyzer.analyze()
      return false
    }
    element.textContent = 'Analyze'
  }

  async renderPriceChanges() {
    const chipClassName = 'price-change-chip'
    if (document.querySelector('.' + chipClassName)) return

    const property = this.property
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

    const property = this.property
    const step = 30
    const daysOnMarket = property.daysOnMarket
    const daysOnMarketLabel = `DOM: ${property.daysOnMarket}`

    if (daysOnMarketLabel === -1) return

    if (daysOnMarket >= step * 2) {
      this.addChip(
        chipClassName,
        daysOnMarketLabel,
        COLORS.lightGreen,
        COLORS.green
      )
    } else if (daysOnMarket >= step) {
      this.addChip(
        chipClassName,
        daysOnMarketLabel,
        COLORS.lightYellow,
        COLORS.yellow
      )
    } else if (daysOnMarket <= 3) {
      this.addChip(
        chipClassName,
        daysOnMarketLabel,
        COLORS.lightRed,
        COLORS.red
      )
    } else if (daysOnMarket <= 7) {
      this.addChip(
        chipClassName,
        daysOnMarketLabel,
        COLORS.lightRed,
        COLORS.red
      )
    } else {
      this.addChip(
        chipClassName,
        daysOnMarketLabel,
        COLORS.lightRed,
        COLORS.red
      )
    }
  }

  async renderSizeChip() {
    const chipClassName = 'size-chip'
    if (document.querySelector('.' + chipClassName)) return

    const property = this.property
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

    const property = this.property
    if (property.hasGoodSchool) {
      this.addChip(
        chipClassName,
        `SCH: Good (${property.goodSchoolsCount})`,
        COLORS.lightGreen,
        COLORS.green
      )
    } else if (property.allBadSchools) {
      this.addChip(chipClassName, 'SCH: Bad', COLORS.lightRed, COLORS.red)
    }
  }

  async renderLotLines() {
    const el = this.addLink('Lot Lines')
    el.addEventListener('click', async () => {
      const factsAndFeatures = await findElementUntil(
        'a',
        /facts and features/i,
        3000
      )
      factsAndFeatures && factsAndFeatures.click()
      const map = await findElementUntil(
        '[data-zon="commute"] title',
        /expand this map/i,
        3000
      )
      if (!map) return
      map.parentElement.parentElement.click()
      const lotLinesButton = await findElementUntil(
        'section#map-lightbox button',
        /lot lines/i,
        3000
      )
      lotLinesButton && lotLinesButton.click()
    })
  }

  async renderBPRentLink() {
    const urlParams = encodeUrlParams({
      fetch_rents: true,
      addresses: [this.property.address]
    })
    const link = `https://www.biggerpockets.com/insights/property-searches/new?${urlParams}`

    this.addLink('BP Rent', link)
  }

  async renderRentometerLink() {
    const urlParams = encodeUrlParams({
      fetch_rents: true,
      addresses: [this.property.address]
    })
    const link = `https://www.rentometer.com/?${urlParams}`

    this.addLink('Rentometer', link)
  }

  addLink(text, link = '') {
    const linkId = text.replaceAll(' ', '-').toLowerCase()
    if (document.querySelector('#' + linkId)) return
    const el = document.createElement('a')
    if (link) {
      el.href = link
      el.target = '_blank'
    }
    el.innerText = text
    el.style.cssText =
      'border: 1px solid; border-radius: 5px; padding: 6px 10px; margin-left: 15px;'
    const targetElement = document.querySelector('#links-container')
    targetElement.append(el)

    return el
  }

  addChip(className, text, bgColor, borderColor) {
    const el = document.createElement('div')
    el.innerText = text
    el.classList.add(className)
    el.style.cssText = `border: 1px solid ${borderColor}; border-radius: 5px; padding: 3px 5px; margin-left: 15px; background-color: ${bgColor};align-items: center; display: flex; height: 30px; margin-top: 10px;`

    this.getChipsContainer().appendChild(el)
  }

  addContainer(id) {
    if (document.querySelector('#' + id)) return

    const el = document.createElement('div')
    el.setAttribute('id', id)
    el.style.cssText = 'display: flex; flex-wrap: wrap; margin-bottom: 10px;'
    const summaryContainer = document.querySelector('.summary-container')
    const targetElement = summaryContainer.querySelector(
      '[data-renderstrat="inline"]'
    )
    targetElement.insertAdjacentElement('afterend', el)
    return el
  }

  getChipsContainer() {
    return document.querySelector('#chips-container')
  }

  getLinksContainer() {
    return document.querySelector('#links-container')
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
