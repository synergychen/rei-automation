class Storage {
  static VERSION = 4
  static INTERESTED = 1
  static NOT_INTERESTED = -1
  static IS_DEAL = 1

  static instance = null

  static async create(databaseName = 'rei') {
    if (!Storage.instance) {
      console.log('Create new Storage instance')
      Storage.instance = new Storage(databaseName)
      await Storage.instance.openDatabase()
    }
    return Storage.instance
  }

  constructor(databaseName = 'rei') {
    this.databaseName = databaseName
  }

  // ------------------
  // --- Properties ---
  // ------------------
  async properties() {
    return await this.getAllData('property')
  }

  async hasProperty(address) {
    return !!(await this.findProperty(address))
  }

  async findProperty(address) {
    return await this.read('property', address)
  }

  async addProperty(property) {
    return !!(await this.write('property', property.address, property))
  }

  async removeProperty(address) {
    return !!(await this.remove('property', address))
  }

  // ------------------
  // --- Interested ---
  // ------------------
  async interested() {
    return (await this.getAllData('interested')).map((el) => el.address)
  }

  async isInterested(address) {
    const val = await this.read('interested', address)
    return !!val && val.interested === Storage.INTERESTED
  }

  async isNotInterested(address) {
    const val = await this.read('interested', address)
    return !!val && val.interested === Storage.NOT_INTERESTED
  }

  async interest(address) {
    return await this.write('interested', address, {
      interested: Storage.INTERESTED
    })
  }

  async uninterest(address) {
    return await this.remove('interested', address)
  }

  async resetInterested() {
    return await this.clearTable('interested')
  }

  // -------------
  // --- Deals ---
  // -------------
  async deals() {
    return (await this.getAllData('deal')).map((el) => el.address)
  }

  async isDeal(address) {
    const val = await this.read('deal', address)
    return !!val && val.deal === Storage.IS_DEAL
  }

  async addDeal(address) {
    return await this.write('deal', address, { deal: Storage.IS_DEAL })
  }

  async removeDeal(address) {
    return await this.remove('deal', address)
  }

  // ------------
  // --- Rent ---
  // ------------
  async rents() {
    return await this.getAllData('rent')
  }

  async hasRent(address) {
    return !!(await this.read('rent', address))
  }

  async findRents(address) {
    const rentVal = await this.read('rent', address)
    if (!rentVal) return null
    return rentVal.rents
  }

  async findRent(address, source) {
    const rentVal = await this.read('rent', address)
    if (!rentVal) return null
    const rents = rentVal.rents
    return rents.find((rent) => rent.source === source)
  }

  async addRent(rent) {
    const address = rent.address || rent.zipcode
    const rentVal = await this.read('rent', address)
    if (rentVal) {
      const rents = rentVal.rents
      const index = rents.findIndex((e) => e.source === rent.source)
      if (index !== -1) {
        // Update when source found
        rents[index] = rent
      } else {
        // Append when source not found
        rents.push(rent)
      }
      return await this.write('rent', address, { rents })
    } else {
      return await this.write('rent', address, { rents: [rent] })
    }
  }

  async removeRent(address) {
    return await this.remove('rent', address)
  }

  // ---------------
  // --- Helpers ---
  // ---------------
  async getAllData(tableName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([tableName])
      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.getAll()

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(event.error)
      }
    })
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, Storage.VERSION)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('interested')) {
          db.createObjectStore('interested', { keyPath: 'address' })
        }
        if (!db.objectStoreNames.contains('property')) {
          db.createObjectStore('property', { keyPath: 'address' })
        }
        if (!db.objectStoreNames.contains('deal')) {
          db.createObjectStore('deal', {
            keyPath: 'address',
            autoIncrement: true
          })
        }
        if (!db.objectStoreNames.contains('rent')) {
          db.createObjectStore('rent', {
            keyPath: 'address',
            autoIncrement: true
          })
        }
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onerror = (event) => {
        console.error('Error opening database', event)
        reject(event.target.error)
      }
    })
  }

  async read(tableName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([tableName])
      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.get(this.normalizeAddress(key))

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(event.error)
      }
    })
  }

  async write(tableName, key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([tableName], 'readwrite')
      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.put({
        ...value,
        address: this.normalizeAddress(key)
      })

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(event.error)
      }
    })
  }

  async remove(tableName, key) {
    const transaction = this.db.transaction([tableName], 'readwrite')
    const objectStore = transaction.objectStore(tableName)
    objectStore.delete(this.normalizeAddress(key))
    console.log(`Record with key ${key} has been removed from ${tableName}.`)
  }

  async clearTable(tableName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([tableName], 'readwrite')
      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.clear()

      request.onsuccess = (event) => {
        resolve()
      }

      request.onerror = (event) => {
        reject(event.error)
      }
    })
  }

  normalizeAddress(address) {
    return address.replace(/\u00A0/g, ' ')
  }
}

module.exports = { Storage }
