const paths = [
  "src/app.js",
  "src/db/data_api.js",
  "src/models/deal.js",
  "src/models/message.js",
  "src/models/property.js",
  "src/models/rent.js",
  "src/services/bigger_pockets_rent_api.js",
  "src/services/home_details_api.js",
  "src/services/zillow.js",
  "src/utils/constants.js",
  "src/utils/helpers.js",
  "src/utils/renderer.js",
  "src/utils/session.js",
  "src/utils/analyzers/deal_analyzer.js",
  "src/utils/analyzers/property_analyzer.js",
  "src/utils/annotators/home_details_annotator.js",
  "src/utils/annotators/map_annotator.js",
  "src/utils/automator/bigger_pockets_rent_automator.js",
  "src/utils/automator/email_automator.js",
  "src/utils/automator/rentometer_automator.js",
  "src/utils/parsers/home_details_parser.js",
  "src/utils/parsers/rent_parser.js"
]
paths.forEach((path) => {
  const obj = require('../' + path)
  Object.assign(module.exports, obj)
})
