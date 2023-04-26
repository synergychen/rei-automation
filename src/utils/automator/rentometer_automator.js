const { logMessage } = require('../helpers')
const { DataAPI } = require('../../db/data_api.js')
const { RentometerAPI } = require('../../services/rentometer_api.js')

class RentometerAutomator {
  constructor(properties = []) {
    this.dataApi = new DataAPI()
    this.properties = properties
  }

  async start(authToken, recaptchaToken) {
    try {
      const properties =
        this.properties.length > 0
          ? this.properties
          : await this.dataApi.propertiesWithoutRentometerRent()
      logMessage(
        `Found ${properties.length} properties without Rentometer rents`
      )
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]
        logMessage('===========================')
        logMessage(`Property: ${property.address}`)
        const rent = await RentometerAPI.fetch(
          property.address,
          property.bedrooms,
          authToken,
          recaptchaToken
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
        await this.pause(5000)
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

module.exports = { RentometerAutomator }
