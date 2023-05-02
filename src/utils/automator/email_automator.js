const { logMessage } = require('../helpers.js')
const { DataAPI } = require('../../db/data_api.js')
const { HomeDetailsAPI } = require('../../services/home_details_api.js')

class EmailAutomator {
  constructor() {
    this.dataApi = new DataAPI()
  }

  async sync() {
    try {
      const success = await this.syncEmails()
      if (success) {
        const messages = await this.getMessages()
        await this.processMessages(messages)
        logMessage('Analyzed successfully')
      }
    } catch (error) {
      logMessage('Error')
      throw error
    }
  }

  async syncEmails() {
    const status = await this.dataApi.syncEmails()
    const success = status === 'OK'
    if (success) {
      logMessage('Email successfully synced')
    } else {
      logMessage('Emails failed to sync')
    }
    return success
  }

  async getMessages() {
    const messages = await this.dataApi.emails()
    logMessage(`Found ${messages.length} new messages`)
    return messages
  }

  async processMessages(messages) {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      await this.processMessage(message)
      await this.markMessageAsRead(message.id)
      await this.pause(5000)
      logMessage(`${messages.length - i - 1} remaining`)
    }
  }

  async processMessage(message) {
    logMessage('==============================================')
    logMessage(
      `Parsing message (${message.id}) with ${message.addresses.length} addresses`
    )
    const addressToPropertyMap = await HomeDetailsAPI.fetchAll(
      message.addresses
    )
    const addresses = Object.keys(addressToPropertyMap)
    logMessage(`Zillow API matched ${addresses.length} addresses`)
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      const property = addressToPropertyMap[address]
      if (property) {
        if (property.valid) {
          await this.dataApi.addProperty(property)
          logMessage(`Successfully saved property: ${property.address}`)
        } else {
          logMessage(`Skipped invalid property: ${property.address}`)
        }
      } else {
        logMessage(`Property not found on zillow: ${property.address}`)
      }
    }
  }

  async markMessageAsRead(messageId) {
    await this.dataApi.markEmailAsRead(messageId)
    logMessage(`Message (${messageId}) marked as read`)
  }

  async pause(ms) {
    logMessage(`Pause for ${ms / 1000} seconds`)
    await new Promise((resolve) => setTimeout(resolve, ms))
  }
}

module.exports = { EmailAutomator }
