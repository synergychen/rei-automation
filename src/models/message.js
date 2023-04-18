class Message {
  static TO_DO = 'TO_DO'
  static DONE = 'DONE'

  constructor({ id, subject, from, addresses, date, status = Message.TO_DO }) {
    this.id = id
    this.subject = subject
    this.from = from
    this.addresses = addresses
    this.date = date
    this.status = status
  }
}

module.exports = { Message }
