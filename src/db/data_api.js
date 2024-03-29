const { serializeAddress } = require('../utils/helpers.js')
const { STATUS } = require('../utils/constants.js')
const { Property } = require('../models/property.js')
const { Message } = require('../models/message.js')

class DataAPI {
  static BASE_URL = 'https://us-central1-rei-automation.cloudfunctions.net/api'
  static SECURITY_TOKEN
  static instance

  constructor() {
    if (DataAPI.instance) {
      return DataAPI.instance
    }

    DataAPI.instance = this
  }

  static setSecurityToken(key) {
    DataAPI.SECURITY_TOKEN = key
  }

  get securityToken() {
    return DataAPI.SECURITY_TOKEN
  }

  verifyToken() {
    if (!this.securityToken) {
      throw new Error('Missing security token')
    }
  }

  // ------------------
  // --- Properties ---
  // ------------------
  async properties() {
    return (await this.getRequest('/properties')).map((e) => new Property(e))
  }

  async propertiesWithoutBiggerPocketsRent() {
    const properties = (
      await this.getRequest(`/properties?status=${STATUS.default}`)
    ).map((e) => new Property(e))
    return properties.filter(p => !p.rents.find(rent => rent.hasBiggerPockets))
  }

  async propertiesWithoutRentometerRent() {
    const properties = (
      await this.getRequest(`/properties?status=${STATUS.default}`)
    ).map((e) => new Property(e))
    return properties.filter(p => !p.rents.find(rent => rent.hasRentometer))
  }

  async hasProperty(address) {
    return !!(await this.findProperty(address))
  }

  async findProperty(address) {
    address = serializeAddress(address)
    const property = await this.getRequest(`/properties/${address}`)
    return property && new Property(property)
  }

  async addProperty(property) {
    property.address = serializeAddress(property.address)
    return await this.postRequest('/properties', property)
  }

  async updateProperty(property) {
    property.address = serializeAddress(property.address)
    return await this.updateRequest(`/properties/${property.address}`, property)
  }

  async removeProperty(address) {
    address = serializeAddress(address)
    return await this.deleteRequest(`/properties/${address}`)
  }

  // async removeSold() {
  //   const [sold, recentlySold, pending] = await Promise.all([
  //     this.getRequest('/properties?homeStatus=SOLD'),
  //     this.getRequest('/properties?homeStatus=RECENTLY_SOLD'),
  //     this.getRequest('/properties?homeStatus=PENDING')
  //   ])

  //   const toDelete = [...sold, ...recentlySold, ...pending]
  //   const addresses = toDelete.map(property => property.address)
  //   return await Promise.all(
  //     addresses.map(async (address) => {
  //       await this.removeProperty(address)
  //     })
  //   )
  // }

  // -------------
  // --- Rents ---
  // -------------
  async updateRent(rent) {
    const property = await this.findProperty(rent.address)
    if (!property) return
    property.updateRent(rent)
    return await this.updateProperty(property)
  }

  // -------------
  // --- Deals ---
  // -------------
  async deals() {
    return await this.getRequest('/deals')
  }

  async isDeal(address) {
    const property = await this.findProperty(address)
    return property && property.isDeal
  }

  async setDeal(address) {
    return await this.updatePropertyStatus(address, STATUS.deal)
  }

  async setNotADeal(address) {
    return await this.updatePropertyStatus(address, STATUS.notADeal)
  }

  // ------------------
  // --- Interested ---
  // ------------------
  async interested() {
    return await this.getRequest('/interested')
  }

  async isInterestedIn(address) {
    const property = await this.findProperty(address)
    return property && property.isInterested
  }

  async setInterested(address) {
    return await this.updatePropertyStatus(address, STATUS.interested)
  }

  async setNotInterested(address) {
    return await this.updatePropertyStatus(address, STATUS.notInterested)
  }

  // ----------------------
  // --- Email listings ---
  // ----------------------
  async emails(status = Message.TO_DO) {
    const messages = await this.getRequest(`/messages?status=${status}`)
    return messages.map((msg) => new Message(msg))
  }

  async markEmailAsRead(id) {
    const message = await this.getRequest(`/messages/${id}`)
    if (!message) return
    message.status = Message.DONE
    return await this.updateRequest(`/messages/${id}`, message)
  }

  // Add new message and mark as TO_DO
  async syncEmails() {
    const data = await this.getRequest(
      'http://localhost:3000/messages?label=rei-agent',
      true
    )
    const messages = data.map((msg) => new Message(msg))
    return await this.postRequest(`/messages`, messages)
  }

  // ---------------
  // --- Helpers ---
  // ---------------
  async updatePropertyStatus(address, status) {
    const property = await this.findProperty(address)
    if (!property) return
    property.status = status
    return await this.updateProperty(property)
  }

  getRequest(url, absoluteUrl = false) {
    this.verifyToken()
    url = absoluteUrl ? url : DataAPI.BASE_URL + url
    return fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.securityToken
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .catch((error) => {
        console.error('There was an error!', error)
      })
  }

  postRequest(url, data) {
    this.verifyToken()
    return fetch(DataAPI.BASE_URL + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.securityToken
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return 'OK'
      })
      .catch((error) => {
        console.error('There was an error!', error)
      })
  }

  updateRequest(url, data) {
    this.verifyToken()
    return fetch(DataAPI.BASE_URL + url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.securityToken
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return 'OK'
      })
      .catch((error) => {
        console.error('There was an error!', error)
      })
  }

  deleteRequest(url) {
    this.verifyToken()
    return fetch(DataAPI.BASE_URL + url, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + this.securityToken
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return 'OK'
      })
      .catch((error) => {
        console.error('There was an error!', error)
      })
  }
}

module.exports = { DataAPI }
