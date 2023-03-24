class Storage {
  static VERSION = 3
  static INTERESTED = 1
  static NOT_INTERESTED = -1
  static IS_DEAL = 1

  static async create(databaseName = 'rei') {
    const storage = new Storage(databaseName)
    await storage.openDatabase()
    return storage
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
