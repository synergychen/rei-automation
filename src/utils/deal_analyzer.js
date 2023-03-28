const { Storage } = require('../db/storage.js')
const { Deal } = require('../models/deal.js')

class DealAnalyzer {
  static async goodDeals(percentThreshold = 0.7) {
    const storage = await Storage.create()
    const properties = await storage.properties()
    const filteredProperties = await Promise.all(
      properties.map(async (property) => {
        const rents = await storage.findRents(property.address)
        const deal = new Deal({
          property,
          rents,
          percentThreshold
        })
        return deal.isGood() ? property : null
      })
    )
    return filteredProperties.filter((property) => property !== null)
  }

  static async isGoodDeal(address, percentThreshold = 0.7) {
    const storage = await Storage.create()
    const property = await storage.findProperty(address)
    if (!property) return
    const rents = await storage.findRents(property.address)
    const deal = new Deal({
      property,
      rents,
      percentThreshold
    })
    return deal.isGood()
  }
}

module.exports = { DealAnalyzer }
