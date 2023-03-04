const rawData = require('./data/sell_example.json')
const Zillow = require('./zillow.js')

const zillow = new Zillow(rawData)
console.log(zillow.csvData())
console.log(zillow.summary())
console.log(zillow.summaryCsvData())
