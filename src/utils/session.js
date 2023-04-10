const { DataAPI } = require('../db/data_api.js')

function currentProperty() {
  const property = HomeDetailsParser.parse()
  return property.address && property.price && property.price > 0
    ? property
    : null
}

async function savedProperty() {
  const dataApi = new DataAPI()
  const property = HomeDetailsParser.parse()
  const propertySaved = await dataApi.findProperty(property.address)
  return propertySaved && new Property(propertySaved)
}

module.exports = { currentProperty, savedProperty }
