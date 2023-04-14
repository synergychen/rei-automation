const { DataAPI } = require('../db/data_api.js')
const { Property } = require('../models/property.js')

async function currentProperty() {
  const property = HomeDetailsParser.parse() || new Property()
  const propertySaved = (await savedProperty()) || new Property()
  property.rents = propertySaved.rents
  property.status = propertySaved.status
  return property
}

async function savedProperty() {
  const dataApi = new DataAPI()
  const property = HomeDetailsParser.parse()
  return await dataApi.findProperty(property.address)
}

module.exports = { currentProperty, savedProperty }
