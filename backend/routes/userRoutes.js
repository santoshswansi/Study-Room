const express = require('express')
const router = express.Router()
const {getUser, registerUser, loginUser, updateUser} = require('../controllers/userControllers')
const {protect} = require('../middlewares/authmiddlewares')

router.route("/").post(registerUser)

 // chained routes handlers for protected route /api/users/me 
router.route("/me").get(protect, getUser).put(protect, updateUser)
router.route("/login").post(loginUser)

module.exports = router