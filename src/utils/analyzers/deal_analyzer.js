const { DataAPI } = require('../../db/data_api.js')
const { Deal } = require('../../models/deal.js')

class DealAnalyzer {
  static async goodDeals(percentThreshold = 0.7) {
    const dataApi = new DataAPI()
    const properties = await dataApi.properties()
    const filteredProperties = await Promise.all(
      properties.map(async (property) => {
        const deal = new Deal({
          property,
          percentThreshold
        })
        return deal.isGood() ? property : null
      })
    )
    return filteredProperties.filter((property) => property !== null)
  }
}

module.exports = { DealAnalyzer }
