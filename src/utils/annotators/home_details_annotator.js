class HomeDetailsAnnotator {
  constructor(storage) {
    this.storage = storage
  }

  async annotate() {
    // Add link to address
    this.annotateAddress()
    // Add BP rent calculator link
    await this.renderBPRentCalculatorLink()
    // Add summary detail
    await this.renderHomeSummary()
    // Add "Interested" button
    await this.renderInterestedButton()
  }

  async renderHomeSummary() {
    const property = await this.getProperty()
    if (property) {
      this.render({
        Year: property.yearBuilt,
        'Days on Market': property.daysOnMarket,
        Rent: property.estimatedRent,
        'Rent To Price': this.toPercent(property.estimatedRentToPrice)
      })
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

  async renderBPRentCalculatorLink() {
    const property = await this.getProperty()
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

  rerender(obj) {
    const existingTables = [...document.querySelectorAll('#' + this.getTableId())]
    existingTables.forEach((table) => table.remove())
    this.render(obj)
  }

  render(obj) {
    // create a table element
    const table = document.createElement('table')
    table.setAttribute('id', this.getTableId())

    // loop through the object keys and create a table row for each key-value pair
    for (const key in obj) {
      const row = document.createElement('tr')
      const keyCell = document.createElement('td')
      const valueCell = document.createElement('td')

      // set the text content for the key and value cells
      keyCell.innerText = key
      valueCell.innerText = obj[key]

      // add the cells to the row
      row.appendChild(keyCell)
      row.appendChild(valueCell)

      // add the row to the table
      table.appendChild(row)
    }

    // append the table to the body of the HTML document
    document.body.appendChild(table)
    this.addTableStyles(table)
    return table
  }

  annotateMap(mappedData, summary) {
    const median = summary.median
    const median25th = summary['25th']
    const median75th = summary['75th']
    this.getMapDotClassNames().forEach((mapDotClassName) => {
      const mapElements = [...document.querySelectorAll('.' + mapDotClassName)]
      // Create mapping: { [zpid]: [el] }
      const mapping = {}
      mapElements.forEach((el) => {
        mapping[this.getZillowIdByElement(el)] = el
      })
      mappedData.forEach((item) => {
        const el = mapping[item.zpid.toString()]
        if (el) {
          if (item.price > median75th) {
            el.style.cssText = el.style.cssText + 'background: #db3a00;'
          } else if (item.price >= median) {
            el.style.cssText = el.style.cssText + 'background: #ff9800;'
          } else if (item.price >= median25th) {
            el.style.cssText = el.style.cssText + 'background: #ffeb3b;'
          } else {
            el.style.cssText = el.style.cssText + 'background: #4caf50;'
          }
        }
      })
    })
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

  async getProperty() {
    return await this.storage.findProperty(this.getAddress())
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

  getZillowIdByElement(el) {
    const propsName = Object.getOwnPropertyNames(el).find((e) =>
      e.startsWith('__reactInternalInstance')
    )
    return el[propsName].return.return.key
  }

  addTableStyles(table) {
    table.style.cssText =
      'z-index: 100000; position: fixed; bottom: 30px; right: 40px; float: right; padding: 10px; background-color: #f2f2f2; border: 1px solid #ccc; opacity: 0.95;'
    this.addStyles(
      table,
      'td',
      'border: 1px solid #ddd; padding: 8px; text-align: left;'
    )
    this.addStyles(
      table,
      'tr td:first-child',
      'background-color: rgb(216 216 216 / 36%); border: 1px solid #ddd; padding: 8px; text-align: left;'
    )
    this.addStyles(table, 'th', 'background-color: #4CAF50; color: white;')
  }

  addStyles(parent, childSelector, cssText) {
    ;[...parent.querySelectorAll(childSelector)].forEach((el) => {
      el.style.cssText = cssText
    })
  }

  getTableId() {
    return 'zillow-summary-table'
  }

  getMapDotClassNames() {
    return ['property-dot', 'property-pill']
  }
}

module.exports = { HomeDetailsAnnotator }
