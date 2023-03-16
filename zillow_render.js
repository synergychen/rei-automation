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
    keyCell.textContent = key
    valueCell.textContent = obj[key]

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
    'z-index: 100000; position: fixed; bottom: 30px; right: 40px; float: right; padding: 10px; background-color: #f2f2f2; border: 1px solid #ccc; opacity: 0.9;'
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
