function summary({ zipcode, bedrooms, sold, forSale, rent }) {
  return {
    'Zipcode': zipcode,
    'Bedrooms': bedrooms,
    'Sold (Average)': sold.average,
    'Sold (Median)': sold.median,
    'For Sale (Average)': forSale.average,
    'For Sale (Median)': forSale.median,
    'Rent (Average)': rent.average,
    'Rent (Median)': rent.median,
    'Rent To Price (Average)': averageRentToPrice(rent, sold),
    'Rent To Price (Median)': medianRentToPrice(rent, sold),
  }
}

function readableSummary({ zipcode, bedrooms, sold, forSale, rent }) {
  return {
    zipcode,
    bedrooms,
    'Sold (Average)': toDollar(sold.average),
    'Sold (Median)': toDollar(sold.median),
    'For Sale (Average)': toDollar(forSale.average),
    'For Sale (Median)': toDollar(forSale.median),
    'Rent (Average)': toDollar(rent.average),
    'Rent (Median)': toDollar(rent.median),
    'Rent To Price (Average)': toPercent(averageRentToPrice(rent, sold)),
    'Rent To Price (Median)': toPercent(medianRentToPrice(rent, sold)),
  }
}

function summaryCsvData({ address, bedrooms, sold, forSale, rent }) {
  return [
    [
      // General
      address,
      bedrooms,
      // Sold
      sold.average,
      sold.median,
      sold.average_size,
      sold.median_size,
      sold.data_points,
      // For Sale
      forSale.average,
      forSale.median,
      forSale.average_size,
      forSale.median_size,
      forSale.data_points,
      // Rent
      rent.average,
      rent.median,
      rent['25th'],
      rent['75th'],
      rent.data_points,
      // Rent to price ratio
      averageRentToPrice(rent, sold),
      medianRentToPrice(rent, sold),
      new Date().toISOString()
    ]
  ]
}

function averageRentToPrice(rent, sold) {
  const rentToPrice = rent.average / sold.average
  return rentToPrice > 0 ? rentToPrice : ''
}

function medianRentToPrice(rent, sold) {
  const rentToPrice = rent.median / sold.median
  return rentToPrice > 0 ? rentToPrice : ''
}

function toDollar(amount) {
  if (amount < 0) return 'N/A'
  return amount
    .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    .replace(/\.\d{2}$/, '')
}

function toPercent(num) {
  if (num < 0) return 'N/A'
  return (num * 100).toFixed(2) + '%'
}
