const paths = [
  "src/app.js",
  "src/db/storage.js",
  "src/lib/renderer.js",
  "src/lib/summary.js",
  "src/lib/parser/property_parser.js",
  "src/lib/parser/rent_parser.js",
  "src/models/property.js",
  "src/services/zillow.js"
]
paths.forEach((path) => {
  const obj = require('../' + path)
  Object.assign(module.exports, obj)
})
