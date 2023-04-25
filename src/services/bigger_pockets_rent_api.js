const { BiggerPocketsRentParser } = require('../utils/parsers/rent_parser.js')

class BiggerPocketsRentAPI {
  static async fetchAll(addresses) {
    const results = {}
    for (const address of addresses) {
      const result = await BiggerPocketsRentAPI.fetch(address)
      if (result) {
        results[result.address] = result
      }
    }
    return results
  }

  static async fetch(address, bedrooms) {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://www.biggerpockets.com/insights/locations?validated_address_search[address]=${encodedAddress}&validated_address_search[structure_type]=house&validated_address_search[beds]=${bedrooms}&adjust_details=true&commit=Adjust details`

    const response = await fetch(url, {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'cache-control': 'max-age=0',
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
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    })

    try {
      const html = await response.text()
      const parser = new DOMParser()
      const htmlDoc = parser.parseFromString(html, 'text/html')
      return BiggerPocketsRentParser.parse(htmlDoc)
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

module.exports = { BiggerPocketsRentAPI }
