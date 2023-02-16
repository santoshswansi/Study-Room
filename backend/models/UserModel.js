const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
  },
  name: {
    type: String,
    required: [true, "Please add a name"]
  }
}, {
  timestamps: true    // default timestamps (createdAt, updatedAt)
})

// User ---> 'users' is the name of the collection
const UserModel = mongoose.model("User", UserSchema)
module.exports = UserModel