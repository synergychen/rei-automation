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
    return await this.getRequest('/properties')
  }

  async hasProperty(address) {
    address = this.normalizeAddress(address)
    return !!(await this.findProperty(address))
  }

  async findProperty(address) {
    address = this.normalizeAddress(address)
    return await this.getRequest(`/properties/${address}`)
  }

  async addProperty(property) {
    return await this.postRequest('/properties', property)
  }

  async updateProperty(property) {
    return await this.updateRequest(`/properties/${property.address}`, property)
  }

  async removeProperty(address) {
    address = this.normalizeAddress(address)
    return await this.deleteRequest(`/properties/${address}`)
  }

  // -------------
  // --- Rents ---
  // -------------
  async rents() {
    return await this.getRequest('/rents')
  }

  async hasRent(address) {
    address = this.normalizeAddress(address)
    return !!(await this.findRent(address))
  }

  async findRents(address) {
    address = this.normalizeAddress(address)
    const rent = await this.findRent(address)
    if (!rent) return null
    return rent.rents
  }

  async findRent(address) {
    address = this.normalizeAddress(address)
    return await this.getRequest(`/rents/${address}`)
  }

  async addRent(rent) {
    const address = this.normalizeAddress(rent.address || rent.zipcode)
    const rents = await this.findRents(address)
    if (rents.length > 0) {
      const index = rents.findIndex((e) => e.source === rent.source)
      if (index !== -1) {
        // Update when source found
        rents[index] = rent
      } else {
        // Append when source not found
        rents.push(rent)
      }
      return await this.postRequest('/rents', { address, rents })
    } else {
      return await this.postRequest('/rents', { address, rents: [rent] })
    }
  }

  async updateRent(rent) {
    const address = this.normalizeAddress(rent.address || rent.zipcode)
    const rents = await this.findRents(address)
    if (rents.length > 0) {
      const index = rents.findIndex((e) => e.source === rent.source)
      if (index !== -1) {
        // Update when source found
        rents[index] = rent
      } else {
        // Append when source not found
        rents.push(rent)
      }
      return await this.updateRequest(`/rents/${address}`, { address, rents })
    } else {
      return await this.updateRequest(`/rents/${address}`, {
        address,
        rents: [rent]
      })
    }
  }

  async removeRent(address) {
    address = this.normalizeAddress(address)
    return await this.deleteRequest(`/rents/${address}`)
  }

  // -------------
  // --- Deals ---
  // -------------
  async deals() {
    return await this.getRequest('/deals')
  }

  async isDeal(address) {
    address = this.normalizeAddress(address)
    return !!(await this.getRequest(`/deals/${address}`))
  }

  async addDeal(address) {
    address = this.normalizeAddress(address)
    return await this.postRequest('/deals', { address })
  }

  async removeDeal(address) {
    address = this.normalizeAddress(address)
    return await this.deleteRequest(`/deals/${address}`)
  }

  // ------------------
  // --- Interested ---
  // ------------------
  async interested() {
    return await this.getRequest('/interested')
  }

  async isInterestedIn(address) {
    address = this.normalizeAddress(address)
    return !!(await this.getRequest(`/interested/${address}`))
  }

  async addInterested(address) {
    address = this.normalizeAddress(address)
    return await this.postRequest('/interested', { address })
  }

  async removeInterested(address) {
    address = this.normalizeAddress(address)
    return await this.deleteRequest(`/interested/${address}`)
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

  normalizeAddress(address) {
    return address.replace(/\u00A0/g, ' ').replace(/\s/, ' ')
  }
}

module.exports = { DataAPI }
