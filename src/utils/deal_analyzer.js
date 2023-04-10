const { DataAPI } = require('../db/data_api.js')
const { Deal } = require('../models/deal.js')

class DealAnalyzer {
  static async goodDeals(percentThreshold = 0.7) {
    const dataApi = new DataAPI()
    const properties = await dataApi.properties()
    const filteredProperties = await Promise.all(
      properties.map(async (property) => {
        const rents = await dataApi.findRents(property.address)
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
    const dataApi = new DataAPI()
    const property = await dataApi.findProperty(address)
    if (!property) return
    const rents = await dataApi.findRents(property.address)
    const deal = new Deal({
      property,
      rents,
      percentThreshold
    })
    return deal.isGood()
  }
}

module.exports = { DealAnalyzer }
