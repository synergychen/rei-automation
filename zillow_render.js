function rerender(obj) {
  const existingTables = [...document.querySelectorAll('#' + getTableId())]
  existingTables.forEach((table) => table.remove())
  render(obj)
}

function render(obj) {
  // create a table element
  const table = document.createElement('table')
  table.setAttribute('id', getTableId())

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
  addTableStyles(table)
  return table
}

async function annotateHomeDetails(storage) {
  // Add link to address
  annotateAddress()
  // Add summary detail
  await renderHomeSummary(storage)
  // Add "Interested" button
  await renderInterestedButton(storage)
}

async function renderHomeSummary(storage) {
  const addressElement = document.querySelector('.summary-container h1')
  if (await storage.hasProperty(addressElement.innerText)) {
    const property = await storage.findProperty(addressElement.innerText)
    if (property) {
      render({
        'Year': property.yearBuilt,
        'Days on Market': property.daysOnMarket,
        'Rent': property.estimatedRent,
        'Rent To Price': toPercent(property.estimatedRentToPrice)
      })
    } else {
      console.log('No analysis done for this property')
    }
  }
}

async function renderInterestedButton(storage) {
  const interestedButtonId = 'interested-button'
  if (document.querySelector('#' + interestedButtonId)) return

  const interestedButton = document.createElement('button')
  interestedButton.setAttribute('id', interestedButtonId)

  const markAsInterested = async () => {
    interestedButton.innerText = 'Interested'
    interestedButton.style.cssText =
      'background-color: #69f0ae; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: none; padding: 5px 10px'
    await storage.interest(getAddress())
    isInterested = true
  }

  const markAsUninterested = async () => {
    interestedButton.innerText = 'Interested?'
    interestedButton.style.cssText =
      'background-color: white; border-radius: 5px; margin-left: 15px; margin-top: 10px; border: 1px solid; padding: 5px 10px'
    await storage.uninterest(getAddress())
    isInterested = false
  }

  let isInterested = await storage.isInterested(getAddress())
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

function annotateMap(mappedData, summary) {
  const median = summary.median
  const median25th = summary['25th']
  const median75th = summary['75th']
  getMapDotClassNames().forEach((mapDotClassName) => {
    const mapElements = [...document.querySelectorAll('.' + mapDotClassName)]
    // Create mapping: { [zpid]: [el] }
    const mapping = {}
    mapElements.forEach((el) => {
      mapping[getZillowIdByElement(el)] = el
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
function annotateAddress() {
  // Select the h1 element with the address
  const addressElement = document.querySelector('.summary-container h1')
  // Get the address text
  const addressText = addressElement.innerText
  // Create a new a element for the link
  const link = document.createElement('a')
  // Set the href attribute to the Google Maps URL with the address
  link.href = `https://www.google.com/maps?q=${encodeURIComponent(addressText)}`
  // Set the target attribute to _blank to open the link in a new tab
  link.target = '_blank'
  // Set the link text to the address
  link.innerText = addressText
  // Replace the h1 content with the link
  addressElement.innerHTML = ''
  addressElement.appendChild(link)
}

function getAddress() {
  // Select the h1 element with the address
  const addressElement = document.querySelector('.summary-container h1')
  // Get the address text
  return addressElement.innerText
}

function getElementById(zillowId) {
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

function getZillowIdByElement(el) {
  const propsName = Object.getOwnPropertyNames(el).find((e) =>
    e.startsWith('__reactInternalInstance')
  )
  return el[propsName].return.return.key
}

function addTableStyles(table) {
  table.style.cssText =
    'z-index: 100000; position: fixed; bottom: 30px; right: 40px; float: right; padding: 10px; background-color: #f2f2f2; border: 1px solid #ccc; opacity: 0.95;'
  addStyles(
    table,
    'td',
    'border: 1px solid #ddd; padding: 8px; text-align: left;'
  )
  addStyles(
    table,
    'tr td:first-child',
    'background-color: rgb(216 216 216 / 36%); border: 1px solid #ddd; padding: 8px; text-align: left;'
  )
  addStyles(table, 'th', 'background-color: #4CAF50; color: white;')
}

function addStyles(parent, childSelector, cssText) {
  ;[...parent.querySelectorAll(childSelector)].forEach((el) => {
    el.style.cssText = cssText
  })
}

function getTableId() {
  return 'zillow-summary-table'
}

function getMapDotClassNames() {
  return ['property-dot', 'property-pill']
}
