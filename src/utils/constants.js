const PROPERTY_ATTRIBTUES = [
  'address',
  'city',
  'state',
  'zipcode',
  'homeType',
  'homeStatus',
  'price',
  'bedrooms',
  'bathrooms',
  'yearBuilt',
  'sqft',
  'daysOnMarket',
  'propertyTaxes',
  'schools',
  'schoolScores',
  'priceHistory',
  'rents',
  'status',
  'comps',
  'nearbyHomes',
  'updatedAt'
]

const COLORS = {
  gray: '#EEEEEE',
  lightGray: '#F5F5F5',
  green: '#69f0ae',
  lightGreen: '#B9F6CA',
  red: '#FF5252',
  lightRed: '#FFCCBC',
  yellow: '#FFD740',
  lightYellow: '#FFE57F'
}

/**
 * Property status
 * - DEFAULT: no status
 * - DEAL: is a deal, potential to be interested
 * - NOT_A_DEAL: is not a deal
 * - INTERESTED: potential to an offer
 * - NOT_INTERESTED: skip
 * - OFFER: potential offer
 */
const STATUS = {
  default: 'DEFAULT',
  deal: 'DEAL',
  notADeal: 'NOT_A_DEAL',
  interested: 'INTERESTED',
  notInterested: 'NOT_INTERESTED',
  offer: 'OFFER'
}

const US_ADDRESS_REGEX =
  /(\d+\s+[\w\s]+(?:\b[A-Z]\w*)*),?\s+([A-Za-z]+),?\s+([A-Z]{2}),?\s+(\d{5})(-\d{4})?/g

module.exports = { PROPERTY_ATTRIBTUES, COLORS, STATUS, US_ADDRESS_REGEX }
