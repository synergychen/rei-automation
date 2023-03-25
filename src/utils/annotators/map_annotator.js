class MapAnnotator {
  annotate() {
  }

  annotateMap(mappedData, summary) {
    const median = summary.median
    const median25th = summary['25th']
    const median75th = summary['75th']
    this.getMapDotClassNames().forEach((mapDotClassName) => {
      const mapElements = [...document.querySelectorAll('.' + mapDotClassName)]
      // Create mapping: { [zpid]: [el] }
      const mapping = {}
      mapElements.forEach((el) => {
        mapping[this.getZillowIdByElement(el)] = el
      })
      mappedData.forEach((item) => {
        const el = mapping[item.zpid.toString()]
        if (el) {
          if (item.price > median75th) {
            el.style.cssText = el.style.cssText + 'background: #db3a00;'
          } else if (item.price >= median) {
            el.style.cssText = el.style.cssText + 'background: #ff9800;'
          } else if (item.price >= median25th) {
            el.style.cssText = el.style.cssText + 'background: #ffeb3b;'
          } else {
            el.style.cssText = el.style.cssText + 'background: #4caf50;'
          }
        }
      })
    })
  }

  getZillowIdByElement(el) {
    const propsName = Object.getOwnPropertyNames(el).find((e) =>
      e.startsWith('__reactInternalInstance')
    )
    return el[propsName].return.return.key
  }

  getMapDotClassNames() {
    return ['property-dot', 'property-pill']
  }
}

module.exports = { MapAnnotator }