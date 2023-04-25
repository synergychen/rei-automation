const { logMessage } = require('../helpers')
const { DataAPI } = require('../../db/data_api.js')
const {
  BiggerPocketsRentAPI
} = require('../../services/bigger_pockets_rent_api.js')

class BiggerPocketsRentAutomator {
  constructor() {
    this.dataApi = new DataAPI()
  }

  async start() {
    try {
      const properties = await this.dataApi.propertiesWithoutBiggerPocketsRent()
      logMessage(`Found ${properties.length} properties without BP rents`)
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]
        logMessage('===========================')
        logMessage(`Property: ${property.address}`)
        const rent = await BiggerPocketsRentAPI.fetch(
          property.address,
          property.bedrooms
        )
        if (rent) {
          logMessage('Successfully fetched rent')
          property.updateRent(rent)
          const updated = await this.dataApi.updateProperty(property)
          updated
            ? logMessage('Successfully updated property')
            : logMessage('Failed to update property')
        } else {
          logMessage('Failed to fetch rent')
        }
        await this.pause(3000)
      }
      logMessage('Finished!')
    } catch (error) {
      logMessage('Error')
      throw error
    }
  }

  async pause(ms) {
    logMessage(`Pause for ${ms / 1000} seconds`)
    await new Promise((resolve) => setTimeout(resolve, ms))
  }
}

module.exports = { BiggerPocketsRentAutomator }
