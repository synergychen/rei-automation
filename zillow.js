class Zillow {
  constructor(rawData) {
    this.rawData = rawData
    this.dataMapping = {
      type: 'statusType',
      address: this._fetchAddress,
      zipcode: 'hdpData.homeInfo.zipcode',
      city: 'hdpData.homeInfo.city',
      state: 'hdpData.homeInfo.state',
      url: this._fetchUrl,
      price: 'hdpData.homeInfo.price',
      bedrooms: 'hdpData.homeInfo.bedrooms',
      bathrooms: 'hdpData.homeInfo.bathrooms',
      homeSize: 'hdpData.homeInfo.livingArea',
      lotSize: this._fetchLotSize,
      homeType: 'hdpData.homeInfo.homeType',
      yearBuilt: '',
      latitude: 'hdpData.homeInfo.latitude',
      longitude: 'hdpData.homeInfo.longitude',
      taxAssessedValue: 'hdpData.homeInfo.taxAssessedValue',
      zestimate: 'hdpData.homeInfo.zestimate',
      rentZestimate: 'hdpData.homeInfo.rentZestimate',
      updatedAt: this._fetchUpdatedAt
    }
  }

  summaryCsvData() {
    return [Object.values(this.summary())]
  }

  summary() {
    const mappedData = this.mappedData()
    const address =
      mappedData.find((e) => e.zipcode.match(/^\d{5}$/)) &&
      mappedData.find((e) => e.zipcode.match(/^\d{5}$/)).zipcode
    const bedrooms =
      mappedData.find((e) => e.bedrooms > 0) &&
      mappedData.find((e) => e.bedrooms > 0).bedrooms
    return {
      address,
      bedrooms,
      average: this.averagePrice(mappedData),
      median: this.medianPrice(mappedData),
      average_size: this.averageSize(mappedData),
      median_size: this.medianSize(mappedData),
      data_points: this.dataPoints(mappedData)
    }
  }

  csvData() {
    return this.mappedData().map((e) => Object.values(e))
  }

  /**
   * -------------------
   * --- Get summary ---
   * -------------------
   */
  averagePrice(csvData) {
    const prices = csvData
      .map((item) => parseInt(item.price))
      .filter((price) => price > 0)
    return this._average(prices)
  }

  medianPrice(csvData) {
    const prices = csvData
      .map((item) => parseInt(item.price))
      .filter((price) => price > 0)
    return this._median(prices)
  }

  averageSize(csvData) {
    const sizes = csvData
      .map((item) => parseInt(item.homeSize))
      .filter((size) => size > 0)
    return this._average(sizes)
  }

  medianSize(csvData) {
    const sizes = csvData
      .map((item) => parseInt(item.homeSize))
      .filter((size) => size > 0)
    return this._median(sizes)
  }

  dataPoints(csvData) {
    const prices = csvData
      .map((item) => parseInt(item.price))
      .filter((price) => price > 0)
    return prices.length
  }

  _average(arr) {
    if (arr.length === 0) {
      return -1
    }
    const avg = arr.reduce((a, b) => a + b) / arr.length
    return Math.round(avg / 1000) * 1000
  }

  _median(arr) {
    if (arr.length == 0) {
      return -1
    }
    arr.sort((a, b) => a - b)
    const midpoint = Math.floor(arr.length / 2)
    const median =
      arr.length % 2 === 1
        ? arr[midpoint]
        : (arr[midpoint - 1] + arr[midpoint]) / 2
    return median
  }

  /**
   * ----------------------------
   * --- Get each data points ---
   * ----------------------------
   */
  mappedData() {
    const mapResults = this._getMapResults()
    return this._getMappedMapResults(mapResults)
  }

  _getMapResults() {
    const path = 'cat1.searchResults.mapResults'
    return this._getDataByPath(this.rawData, path)
  }

  _getMappedMapResults(list) {
    const mappedList = []
    for (let i = 0; i < list.length; i++) {
      let item = {}
      Object.keys(this.dataMapping).forEach((colName) => {
        const path = this.dataMapping[colName]
        item[colName] = this._getDataByPath(list[i], path)
      })
      mappedList.push(item)
    }
    return mappedList
  }

  _getDataByPath(obj, runner) {
    switch (typeof runner) {
      case 'string':
        const paths = runner.split('.')
        if (paths.length === 0) return '-'
        for (let i = 0; i < paths.length; i++) {
          if (!obj) return '-'
          obj = obj[paths[i]]
        }
        return obj
      case 'function':
        const newRunner = runner.bind(this)
        return newRunner(obj)
      default:
        return runner
    }
  }

  _fetchAddress(mapResultItem) {
    return mapResultItem.detailUrl.split('/')[2].replaceAll('-', ' ')
  }

  _fetchUrl(mapResultItem) {
    const baseUrl = 'https://www.zillow.com'
    return mapResultItem.detailUrl ? baseUrl + mapResultItem.detailUrl : ''
  }

  _fetchLotSize(mapResultItem) {
    const size = this._getDataByPath(
      mapResultItem,
      'hdpData.homeInfo.lotAreaValue'
    )
    const unit = this._getDataByPath(
      mapResultItem,
      'hdpData.homeInfo.lotAreaUnit'
    )
    if (unit === 'sqft') {
      return size
    } else if (unit === 'acres') {
      return Math.floor(size * 43560)
    } else {
      return '-'
    }
  }

  _fetchUpdatedAt(_) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }
}

module.exports = Zillow
