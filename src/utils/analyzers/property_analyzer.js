const { DataAPI } = require('../../db/data_api.js')

class PropertyAnalyzer {
  static async analyze() {
    const dataApi = new DataAPI()
    // Save property if not analyzed before
    const property = await currentProperty()
    if (property.valid) {
      await dataApi.addProperty(property)
      console.log('Property saved')
    }
    const searchParams = new URLSearchParams(window.location.search)
    const delay = searchParams.get('delay')
    const urlParams = `address=${property.address}&bedrooms=${property.bedrooms}&delay=${delay}`
    // Analyze rent on Rentometer and BP rent calculator
    const urls = [
      // BP link
      `https://www.biggerpockets.com/insights/locations?validated_address_search%5Baddress%5D=${property.address}+++&validated_address_search%5Bstructure_type%5D=&validated_address_search%5Bbeds%5D=${property.bedrooms}&validated_address_search%5Bbaths%5D=${property.bathrooms}&adjust_details=true&commit=Adjust+details&${urlParams}`,
      // Rentometer
      `https://www.rentometer.com/?${urlParams}`
    ]
    urls.forEach((url) => window.open(url, '_blank'))
  }

  static async analyzeProperties(addresses) {
  }

  static async analyzeRentometerRents(addresses) {
  }

  static async analyzeBPRents(addresses) {
  }
}

module.exports = { PropertyAnalyzer }
