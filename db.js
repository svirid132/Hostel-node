const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/Test')
const db = mongoose.connection
db.on('error', err => {
    console.error('Ошибка MongoDB' + err.message)
    process.exit(1)
})
db.once('open', () => console.log('Установлео соединение с MongoDB'))

const User = require('./models/user')

module.exports = {
    getVacations: async (options = {}) => Vacation.find(options),
    getVacationBySku: async sku => Vacation.findOne({ sku }),
    updateVacationBySku: async (sku, data) => Vacation.updateOne({ sku }, data),
    addVacationInSeasonListener: async (email, sku) => {
      await VacationInSeasonListener.updateOne(
        { email },
        { $push: { skus: sku } },
        { upsert: true }
      )
    },
    getAttractions: async (options = {}) => Attraction.find(options),
    addAttraction: async attraction => new Attraction(attraction).save(),
  
    getUserById: async id => User.findById(id),
    getUserByAuthId: async authId => User.findOne({ authId }),
    addUser: async data => new User(data).save(),
    close: () => mongoose.connection.close(),
  }