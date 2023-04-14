const PROPERTY_ATTRIBTUES = [
  'address',
  'city',
  'state',
  'zipcode',
  'homeType',
  'price',
  'bedrooms',
  'bathrooms',
  'yearBuilt',
  'sqft',
  'daysOnMarket',
  'propertyTaxes',
  'schoolScores',
  'priceHistory',
  'rents',
  'status',
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

module.exports = { PROPERTY_ATTRIBTUES, COLORS, STATUS }
