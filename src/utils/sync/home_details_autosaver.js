const { DataAPI } = require('../../db/data_api.js')

class HomeDetailsAutosaver {
  static async autosave() {
    const dataApi = new DataAPI()
    // Update property
    const property = await currentProperty()
    const saved = await savedProperty()
    console.log('Property:', property)
    if (saved && property.valid && (property.onMarket || saved.missingStatus)) {
      // Update when
      // 1. property saved before
      // 2. property valid
      // 3. property still on market
      await dataApi.updateProperty(property)
      console.log('Property updated')
    } else if (!property.valid) {
      console.log('Property invalid')
    } else {
      console.log('Unknown property status')
    }
  }
}

module.exports = { HomeDetailsAutosaver }
