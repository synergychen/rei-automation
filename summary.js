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
