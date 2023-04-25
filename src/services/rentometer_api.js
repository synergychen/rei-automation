const { RentometerRentParser } = require('../utils/parsers/rent_parser.js')

class RentometerAPI {
  static async fetchAll(addresses) {
    const results = {}
    for (const address of addresses) {
      const result = await RentometerAPI.fetch(address)
      if (result) {
        results[result.address] = result
      }
    }
    return results
  }

  static async fetch(address, bedrooms, authenticityToken, recaptchaResponse) {
    const body = {
      _method: 'create',
      authenticity_token: authenticityToken,
      unified_search: {
        search_type: 'address',
        mb_api_calls: '0',
        latitude: '',
        longitude: '',
        google_place_id: '',
        address,
        address_line_2: '',
        price: '',
        bed_style: bedrooms,
        baths: '',
        max_age: '365',
        radius: '-1',
        building_type: '',
        min_price: '',
        max_price: '',
        min_sqft: '',
        max_sqft: '',
        report_branding_id: '3111'
      },
      commit: 'Analyze',
      'recaptcha-v3-response': recaptchaResponse
    }
    const response = await fetch(
      'https://www.rentometer.com/unified_searches',
      {
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
          'cache-control': 'max-age=0',
          'content-type': 'application/x-www-form-urlencoded',
          'sec-ch-ua':
            '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1'
        },
        referrer: 'https://www.rentometer.com/',
        referrerPolicy: 'origin-when-cross-origin',
        body: RentometerAPI.encodeQueryString(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'include'
      }
    )

    try {
      const html = await response.text()
      const parser = new DOMParser()
      const htmlDoc = parser.parseFromString(html, 'text/html')
      return RentometerRentParser.parse(htmlDoc)
    } catch (error) {
      console.log(error)
      return null
    }
  }

  static encodeQueryString(obj) {
    const parts = []

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]

        if (typeof value === 'object') {
          for (const subKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, subKey)) {
              const subValue = value[subKey]

              if (subValue != null) {
                parts.push(
                  `${encodeURIComponent(key)}[${encodeURIComponent(
                    subKey
                  )}]=${encodeURIComponent(subValue)}`
                )
              }
            }
          }
        } else if (value != null) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        }
      }
    }

    return parts.join('&')
  }
}

module.exports = { RentometerAPI }
