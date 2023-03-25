const { Property } = require('../models/property.js')

async function currentProperty(storage) {
  const property = HomeDetailsParser.parse()
  const propertySaved = await storage.findProperty(property.address)
  if (propertySaved) {
    return new Property(propertySaved)
  }
  return property
}

module.exports = { currentProperty }
