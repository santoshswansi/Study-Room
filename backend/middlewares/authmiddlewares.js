const jsonwebtoken = require('jsonwebtoken')
const UserModel = require('../models/UserModel')

const protect = async (req, res, next) => {
  let token 
  
  // If authorization headers are set with Bearer Token [Format: Bearer Token]
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    try{
      // get token from headers
      token = req.headers.authorization.split(" ")[1]

      // no callback supplied to jsonwebtoken.verify() ===> It acts synchronously
      // Verify token and get decoded payload if signature is valid
      const decodedPayload = jsonwebtoken.verify(token, process.env.JWT_SECRET)

      // get authorized user's data and put to request(req) object  ==> so that
      // protected route can access the data 
      req.userId = decodedPayload.id

      next()
      return 
    }catch(err){
      res.status(401)
      next(new Error("Invalid token"))
    }
  }

  // If token is not set in authorization headers
  if(!token){
    res.status(401)
    next(new Error('Not authorized, no token'))
  }
}

module.exports = {
  protect
}