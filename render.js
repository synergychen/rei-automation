function render(obj) {
  // create a table element
  const table = document.createElement('table')
  table.setAttribute('id', 'summary-table')
  addStyles(tableStyles())

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
  return table
}

function addStyles(styleText) {
  const styleElement = document.createElement('style')
  styleElement.textContent = styleText
  document.head.appendChild(styleElement)
}

function tableStyles() {
  return `
    #summary-table {
        z-index: 1000;
        position: fixed;
        bottom: 30px;
        right: 40px;
        float: right;
        padding: 10px;
        background-color: #f2f2f2;
        border: 1px solid #ccc;
        opacity: 0.9;
    }
    #summary-table table {
        border-collapse: collapse;
        width: 100%;
    }
    #summary-table td, #summary-table th {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    #summary-table tr td:first-child {
        background-color: rgb(216 216 216 / 36%);
    }
    #summary-table th {
        background-color: #4CAF50;
        color: white;
    }
    `
}
