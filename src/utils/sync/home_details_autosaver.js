const { DataAPI } = require('../../db/data_api.js')

class HomeDetailsAutosaver {
  static async autosave() {
    const dataApi = new DataAPI()
    // Update property
    const property = await currentProperty()
    const saved = await savedProperty()
    console.log('Property:', property)
    if (property.onMarket || saved.missingStatus) {
      if (saved) {
        await dataApi.updateProperty(property)
        console.log('Property updated')
      } else {
        await dataApi.addProperty(property)
        console.log('Property added')
      }
    } else if (!property.valid) {
      console.log('Property invalid')
    } else {
      console.log('Unknown property status')
    }
  }
}

module.exports = { HomeDetailsAutosaver }
