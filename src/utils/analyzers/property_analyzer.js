const { DataAPI } = require('../../db/data_api.js')

class PropertyAnalyzer {
  static async analyze() {
    const dataApi = new DataAPI()
    // Save property if not analyzed before
    const property = currentProperty()
    const propertySaved = await savedProperty()
    if (property.valid && !propertySaved) {
      await dataApi.addProperty(property)
      console.log('Property saved')
      await dataApi.addEmptyRent(property.address)
      console.log('Empty rent entry created')
    }
    // Analyze rent on Rentometer and BP rent calculator
    const urls = [
      // BP link
      `https://www.biggerpockets.com/insights/locations?validated_address_search%5Baddress%5D=${property.address}+++&validated_address_search%5Bstructure_type%5D=&validated_address_search%5Bbeds%5D=${property.bedrooms}&validated_address_search%5Bbaths%5D=${property.bathrooms}&adjust_details=true&commit=Adjust+details`,
      // Rentometer
      `https://www.rentometer.com/?address=${property.address}&bedrooms=${property.bedrooms}`
    ]
    urls.forEach((url) => window.open(url, '_blank'))
  }
}

module.exports = { PropertyAnalyzer }
