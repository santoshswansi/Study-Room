const mongoose = require('mongoose')

// All the fields will be saved in the database, even if some of them are not
// specified in the Schema model
mongoose.set('strictQuery', false)

const connectMongoDB = async () => {
  try{
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected ${conn.connection.host}`)
  }catch(err){
    console.log(err)
    process.exit(1)
  }
}

module.exports = connectMongoDB