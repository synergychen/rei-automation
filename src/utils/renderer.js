class Renderer {
  static TABLE_ID = 'zillow-summary-table'

  static rerender(obj) {
    const existingTables = [
      ...document.querySelectorAll('#' + Renderer.TABLE_ID)
    ]
    existingTables.forEach((table) => table.remove())
    Renderer.render(obj)
  }

  static render(obj) {
    // create a table element
    const table = document.createElement('table')
    table.setAttribute('id', Renderer.TABLE_ID)

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
    Renderer.addTableStyles(table)
    return table
  }

  static addTableStyles(table) {
    table.style.cssText =
      'z-index: 100000; position: fixed; bottom: 30px; right: 40px; float: right; padding: 10px; background-color: #f2f2f2; border: 1px solid #ccc; opacity: 0.95;'
    Renderer.addStyles(
      table,
      'td',
      'border: 1px solid #ddd; padding: 8px; text-align: left;'
    )
    Renderer.addStyles(
      table,
      'tr td:first-child',
      'background-color: rgb(216 216 216 / 36%); border: 1px solid #ddd; padding: 8px; text-align: left;'
    )
    Renderer.addStyles(table, 'th', 'background-color: #4CAF50; color: white;')
  }

  static addStyles(parent, childSelector, cssText) {
    ;[...parent.querySelectorAll(childSelector)].forEach((el) => {
      el.style.cssText = cssText
    })
  }
}

module.exports = { Renderer }
