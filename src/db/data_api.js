const { serializeAddress } = require('../utils/helpers.js')
const { Property } = require('../models/property.js')

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

  // ------------------
  // --- Properties ---
  // ------------------
  async properties() {
    return (await this.getRequest('/properties')).map((e) => new Property(e))
  }

  async hasProperty(address) {
    return !!(await this.findProperty(address))
  }

  async findProperty(address) {
    address = serializeAddress(address)
    return new Property(await this.getRequest(`/properties/${address}`))
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
    // TODO
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
    // TODO
  }

  async isInterestedIn(address) {
    const property = await this.findProperty(address)
    return property && property.is.interested
  }

  async setInterested(address) {
    return await this.updatePropertyStatus(address, STATUS.interested)
  }

  async setNotInterested(address) {
    return await this.updatePropertyStatus(address, STATUS.notInterested)
  }

  async updatePropertyStatus(address, status) {
    const property = await this.findProperty(address)
    if (!property) return
    property.status = status
    return await this.updateProperty(property)
  }

  getRequest(url) {
    return fetch(DataAPI.BASE_URL + url, {
      headers: {
        Authorization: 'Bearer ' + DataAPI.SECURITY_TOKEN
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
    return fetch(DataAPI.BASE_URL + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + DataAPI.SECURITY_TOKEN
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
    return fetch(DataAPI.BASE_URL + url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + DataAPI.SECURITY_TOKEN
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
    return fetch(DataAPI.BASE_URL + url, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + DataAPI.SECURITY_TOKEN
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
