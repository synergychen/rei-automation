class DataAPI {
  static BASE_URL = 'https://us-central1-rei-automation.cloudfunctions.net/api'

  // ------------------
  // --- Properties ---
  // ------------------
  async properties() {
    return await this.getRequest('/properties')
  }

  async hasProperty(address) {
    return !!(await this.findProperty(address))
  }

  async findProperty(address) {
    return await this.getRequest(`/properties/${address}`)
  }

  async addProperty(property) {
    return await this.postRequest('/properties', property)
  }

  async updateProperty(property) {
    return await this.updateRequest(
      DataAPI.BASE_URL + `/properties/${property.address}`,
      property
    )
  }

  async removeProperty(address) {
    return await this.deleteRequest(`/properties/${address}`)
  }

  // -------------
  // --- Rents ---
  // -------------
  async rents() {
    return await this.getRequest('/rents')
  }

  async hasRent(address) {
    return !!(await this.findRent(address))
  }

  async findRent(address) {
    return await this.getRequest(`/rents/${address}`)
  }

  async addRent(rent) {
    return await this.postRequest('/rents', rent)
  }

  async updateRent(rent) {
    return await this.updateRequest(`/rents/${rent.address}`, rent)
  }

  async removeRent(address) {
    return await this.deleteRequest(`/rents/${address}`)
  }

  // -------------
  // --- Deals ---
  // -------------
  async deals() {
    return await this.getRequest('/deals')
  }

  async isDeal(address) {
    return !!(await this.getRequest(`/deals/${address}`))
  }

  async addDeal(address) {
    return await this.postRequest('/deals', { address })
  }

  async removeDeal(address) {
    return await this.deleteRequest(`/deals/${address}`)
  }

  // ------------------
  // --- Interested ---
  // ------------------
  async interested() {
    return await this.getRequest('/interested')
  }

  async isInterestedIn(address) {
    return !!(await this.findInterested(address))
  }

  async addInterested(address) {
    return await this.postRequest('/interested',  { address })
  }

  async removeInterested(address) {
    return await this.deleteRequest(`/interested/${address}`)
  }

  getRequest(url) {
    return fetch(DataAPI.BASE_URL + url)
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
        'Content-Type': 'application/json'
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
        'Content-Type': 'application/json'
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
      method: 'DELETE'
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
