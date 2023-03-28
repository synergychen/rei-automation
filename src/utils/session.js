const { Storage } = require('../db/storage.js')
const { Property } = require('../models/property.js')

async function currentProperty() {
  const storage = await Storage.create()
  const property = HomeDetailsParser.parse()
  const propertySaved = await storage.findProperty(property.address)
  if (propertySaved) {
    return new Property(propertySaved)
  }
  return property
}

module.exports = { currentProperty }
