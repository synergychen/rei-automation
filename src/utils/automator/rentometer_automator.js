class RentometerAutomater {
  static search(address, bedrooms) {
    document.querySelector('input#address_unified_search_address').value =
      address
    document.querySelector('#address_unified_search_bed_style').value = bedrooms
    setTimeout(() => {
      document.querySelector('input[type="submit"]').click()
    }, 3000)
  }
}

module.exports = { RentometerAutomater }
