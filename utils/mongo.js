const mongoose = require('mongoose')

module.exports = async () => {
    await mongoose.connect(process.env.MONGO_SRV,
    {
        keepAlive: true
    })
	return mongoose
}