class Summary {
  constructor({ zipcode, bedrooms, sold, forSale, rent }) {
    this.zipcode = zipcode
    this.bedrooms = bedrooms
    this.soldAverage = sold.average
    this.soldMedian = sold.median
    this.forSaleAverage = forSale.average
    this.forSaleMedian = forSale.median
    this.rentAverage = rent.average
    this.rentMedian = rent.median
    this.rentToPriceAverage = this.averageRentToPrice(rent, sold)
    this.rentToPriceMedian = this.medianRentToPrice(rent, sold)
  }

  getSummary() {
    return {
      Zipcode: this.zipcode,
      Bedrooms: this.bedrooms,
      'Sold (Average)': this.soldAverage,
      'Sold (Median)': this.soldMedian,
      'For Sale (Average)': this.forSaleAverage,
      'For Sale (Median)': this.forSaleMedian,
      'Rent (Average)': this.rentAverage,
      'Rent (Median)': this.rentMedian,
      'Rent To Price (Average)': this.rentToPriceAverage,
      'Rent To Price (Median)': this.rentToPriceMedian
    }
  }

  getReadableSummary() {
    return {
      zipcode: this.zipcode,
      bedrooms: this.bedrooms,
      'Sold (Average)': toDollar(this.soldAverage),
      'Sold (Median)': toDollar(this.soldMedian),
      'For Sale (Average)': toDollar(this.forSaleAverage),
      'For Sale (Median)': toDollar(this.forSaleMedian),
      'Rent (Average)': toDollar(this.rentAverage),
      'Rent (Median)': toDollar(this.rentMedian),
      'Rent To Price (Average)': toPercent(this.rentToPriceAverage),
      'Rent To Price (Median)': toPercent(this.rentToPriceMedian)
    }
  }

  getCsvData(address) {
    return [
      [
        // General
        address,
        this.bedrooms,
        // Sold
        this.soldAverage,
        this.soldMedian,
        sold.average_size,
        sold.median_size,
        sold.data_points,
        // For Sale
        this.forSaleAverage,
        this.forSaleMedian,
        this.forSaleAverage_size,
        this.forSaleMedian_size,
        this.forSaleData_points,
        // Rent
        this.rentAverage,
        this.rentMedian,
        this.rent25th,
        this.rent75th,
        this.rentData_points,
        // Rent to price ratio
        this.rentToPriceAverage,
        this.rentToPriceMedian,
        new Date().toISOString()
      ]
    ]
  }

  averageRentToPrice(rent, sold) {
    return this.rentToPrice(rent.average, sold.average)
  }

  medianRentToPrice(rent, sold) {
    return this.rentToPrice(rent.median, sold.median)
  }

  rentToPrice(rent, price) {
    const ratio = rent / price
    return ratio > 0 ? ratio : -1
  }
}

module.exports = { Summary }