const { Property } = require('../models/property.js')

class HomeDetailsAPI {
  static async fetchAll(addresses) {
    const api = new HomeDetailsAPI()
    return await api.fetchAll(addresses)
  }

  static async fetch(address) {
    const api = new HomeDetailsAPI()
    return await api.fetch(address)
  }

  async fetchAll(addresses) {
    const results = {}
    for (const address of addresses) {
      const result = await this.fetch(address)
      if (result) {
        results[result.address] = result
      }
    }
    return results
  }

  async fetch(address) {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://www.zillow.com/homes/${encodedAddress}`

    const response = await fetch(url, {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'sec-ch-ua':
          '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      },
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET'
    })

    try {
      const html = await response.text()
      const parser = new DOMParser()
      const htmlDoc = parser.parseFromString(html, 'text/html')
      const propertyData = this.parsePropertyData(htmlDoc)
      return this.parse(propertyData)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  parsePropertyData(htmlDoc) {
    const json = JSON.parse(
      htmlDoc.body.querySelector('script#hdpApolloPreloadedData').innerText
    )
    return this.findLargestObjectByKey(json, 'property')
  }

  findLargestObjectByKey(obj, targetKey) {
    let largestSize = -1
    let largestObject = null
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        let parsedValue
        try {
          parsedValue = JSON.parse(obj[key])
        } catch (e) {
          // ignore the error and continue iterating
        }
        if (parsedValue) {
          obj[key] = parsedValue
        }
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (key === targetKey && Object.keys(obj[key]).length > largestSize) {
          largestSize = Object.keys(obj[key]).length
          largestObject = obj[key]
        }
        const nestedObject = this.findLargestObjectByKey(obj[key], targetKey)
        if (
          nestedObject !== null &&
          Object.keys(nestedObject).length > largestSize
        ) {
          largestSize = Object.keys(nestedObject).length
          largestObject = nestedObject
        }
      }
    }
    return largestObject
  }

  parse(data) {
    const {
      address,
      price,
      bedrooms,
      bathrooms,
      homeType,
      homeStatus,
      yearBuilt,
      livingArea,
      daysOnZillow,
      propertyTaxRate,
      schools,
      priceHistory,
      comps,
      nearbyHomes
    } = data
    const { streetAddress, city, state, zipcode } = address
    return new Property({
      address: `${streetAddress}, ${city}, ${state} ${zipcode}`,
      streetAddress,
      city,
      state,
      zipcode,
      homeType,
      homeStatus,
      price,
      bedrooms,
      bathrooms,
      yearBuilt,
      sqft: livingArea,
      daysOnMarket: daysOnZillow,
      propertyTaxes: parseInt((propertyTaxRate * price) / 100),
      schools,
      schoolScores: (schools || []).map((sch) => sch.rating),
      priceHistory: (priceHistory || []).map((history) => ({
        date: history.date,
        priceChange: history.priceChangeRate,
        price: history.price,
        event: history.event,
        time: history.time
      })),
      rents: [],
      comps: (comps || []).map((comp) => this.parse(comp)),
      nearbyHomes: (nearbyHomes || []).map((home) => this.parse(home))
    })
  }
}

module.exports = { HomeDetailsAPI }
