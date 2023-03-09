let tableId = 'zillow-summary-table'

function rerender(obj) {
  const existingTables = [...document.querySelectorAll('#' + tableId)]
  existingTables.forEach((table) => table.remove())
  render(obj)
}

function render(obj) {
  // create a table element
  const table = document.createElement('table')
  table.setAttribute('id', tableId)

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

function addTableStyles(table) {
  table.style.cssText =
    'z-index: 1000; position: fixed; bottom: 30px; right: 40px; float: right; padding: 10px; background-color: #f2f2f2; border: 1px solid #ccc; opacity: 0.9;'
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
