const { Storage } = require('../db/storage.js')

function currentProperty() {
  const property = HomeDetailsParser.parse()
  return property.address && property.price && property.price > 0
    ? property
    : null
}

async function savedProperty() {
  const storage = await Storage.create()
  const property = HomeDetailsParser.parse()
  const propertySaved = await storage.findProperty(property.address)
  if (propertySaved) {
    return new Property(propertySaved)
  }
  return property
}

async function currentStorage() {
  return await Storage.create()
}

module.exports = { currentProperty, savedProperty, currentStorage }
