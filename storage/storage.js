class Storage {
  static VERSION = 2
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

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, Storage.VERSION)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('visited')) {
          db.createObjectStore('visited', { keyPath: 'address' })
        }
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
    objectStore.delete(key)
    console.log(`Record with key ${key} has been removed from ${tableName}.`)
  }

  async resetVisited() {
    return this.clearTable('visited')
  }

  async resetInterested() {
    return this.clearTable('interested')
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

  async visited() {
    return (await this.getAllData('visited')).map(el => el.address)
  }

  async interested() {
    return (await this.getAllData('interested')).map((el) => el.address)
  }

  async properties() {
    return this.getAllData('property')
  }

  async deals() {
    return (await this.getAllData('deal')).map((el) => el.address)
  }

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

  async find(address) {
    return this.read('property', address)
  }

  async isVisited(address) {
    const visited = await this.read('visited', address)
    return !!visited
  }

  async isInterested(address) {
    const val = await this.read('interested', address)
    return !!val && val.interested === Storage.INTERESTED
  }

  async isNotInterested(address) {
    const val = await this.read('interested', address)
    return !!val && val.interested === Storage.NOT_INTERESTED
  }

  async isDeal(address) {
    const val = await this.read('deal', address)
    return !!val && val.deal === Storage.IS_DEAL
  }

  async visit(address) {
    return this.write('visited', address, true)
  }

  async interest(address) {
    return this.write('interested', address, { interested: Storage.INTERESTED })
  }

  async uninterest(address) {
    return this.write('interested', address, {
      interested: Storage.NOT_INTERESTED
    })
  }

  async addDeal(address) {
    return this.write('deal', address, { deal: Storage.IS_DEAL })
  }

  async removeDeal(address) {
    return this.remove('deal', address)
  }

  normalizeAddress(address) {
    return address.replace(/\u00A0/g, ' ')
  }
}
