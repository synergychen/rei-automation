const { DataAPI } = require('../db/data_api.js')
const { Property } = require('../models/property.js')
const { HomeDetailsAPI } = require('../services/home_details_api.js')
const { HomeDetailsParser } = require('./parsers/home_details_parser.js')

async function currentProperty() {
  const address = HomeDetailsParser.parse().address
  const [fetchedProperty, saved] = await Promise.all([
    HomeDetailsAPI.fetch(address),
    savedProperty()
  ])
  const property = fetchedProperty || new Property()
  if (saved) {
    property.rents = saved.rents
    property.status = saved.status
  }
  return property
}

async function savedProperty() {
  const dataApi = new DataAPI()
  const property = HomeDetailsParser.parse()
  return await dataApi.findProperty(property.address)
}

module.exports = { currentProperty, savedProperty }
