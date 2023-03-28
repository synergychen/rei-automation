const { Storage } = require('../../db/storage.js')
const { Renderer } = require('../renderer.js')
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
    // Add size: large or small
    await this.renderSizeChip()
    // Add BP rent calculator link
    await this.renderBPRentCalculatorLink()
    // Add summary detail
    await this.renderHomeSummary()
    // Add "Interested" button
    await this.renderInterestedButton()
  }

  async renderHomeSummary() {
    const property = await currentProperty()
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
      interestedButton.style.cssText =
        'background-color: #69f0ae; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: none; padding: 5px 10px'
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
      ? 'background-color: #69f0ae; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: none; padding: 5px 10px'
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

  async renderSizeChip() {
    const property = await currentProperty()
    if (property.isLargeSize()) {
      this.addChip('size-chip', 'Large', '#b9f6ca')
    } else if (property.isSmallSize()) {
      this.addChip('size-chip', 'Small', '#ff8a80')
    }
  }

  async renderBPRentCalculatorLink() {
    const property = await currentProperty()
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
    el.innerText = 'Rent'
    el.style.cssText =
      'border: 1px solid; border-radius: 5px; padding: 6px 10px; margin-left: 15px;'

    const summaryContainer = document.querySelector('.summary-container')
    const targetElement = summaryContainer.querySelector(
      '[data-renderstrat="inline"]'
    )
    targetElement.insertAdjacentElement('afterend', el)
  }

  addChip(id, text, color) {
    if (document.querySelector('#' + id)) return
    const el = document.createElement('span')
    el.innerText = text
    el.style.cssText = `border: 1px solid ${color}; border-radius: 5px; padding: 6px 10px; margin-left: 15px; background-color: ${color}`

    const summaryContainer = document.querySelector('.summary-container')
    const targetElement = summaryContainer.querySelector(
      '[data-renderstrat="inline"]'
    )
    targetElement.insertAdjacentElement('afterend', el)
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
