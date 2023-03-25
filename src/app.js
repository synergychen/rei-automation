const paths = [
  "src/app.js",
  "src/db/storage.js",
  "src/models/property.js",
  "src/services/zillow.js",
  "src/utils/summary.js",
  "src/utils/annotators/home_details_annotator.js",
  "src/utils/parsers/property_parser.js",
  "src/utils/parsers/rent_parser.js"
]
paths.forEach((path) => {
  const obj = require('../' + path)
  Object.assign(module.exports, obj)
})
