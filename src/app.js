const paths = [
  "src/app.js",
  "src/db/data_api.js",
  "src/models/deal.js",
  "src/models/property.js",
  "src/models/rent.js",
  "src/services/zillow.js",
  "src/utils/constants.js",
  "src/utils/deal_analyzer.js",
  "src/utils/helpers.js",
  "src/utils/renderer.js",
  "src/utils/session.js",
  "src/utils/annotators/home_details_annotator.js",
  "src/utils/annotators/map_annotator.js",
  "src/utils/automator/rentometer_automator.js",
  "src/utils/parsers/home_details_parser.js",
  "src/utils/parsers/rent_parser.js"
]
paths.forEach((path) => {
  const obj = require('../' + path)
  Object.assign(module.exports, obj)
})
