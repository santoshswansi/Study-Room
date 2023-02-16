// api/users controllers OR route handlers (MIDDLE-WARES)

const UserModel = require('../models/UserModel')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

// @desc register a user
// @route POST /api/users 
// @access public
async function registerUser(req, res, next){
  const {name, email, password} = req.body

  if(!name || !email || !password){
    res.status(400)
    const err = new Error("User credentials cannot be empty")
    next(err) // pass the error to next middleware
    return
  }

  try{
    const user = await UserModel.findOne({ email: email })
    if (user) {
      // user already exist
      res.status(400)
      const err = new Error("Email is already registered")
      next(err)
      return
    }

    const salt = await bcryptjs.genSalt(10) // 10 rounds
    const hashedPassword = await bcryptjs.hash(password, salt)

    const newUser = await UserModel.create({email: email, password: hashedPassword, name: name})
    res.status(201).json({
      message: "User created",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        token: getJWTToken(newUser._id),
      },
    });
  }catch(err){
    res.status(500)
    console.error(err)
    next(new Error("Failed to register user. Try again later."));
  }
}

// @desc authenticate a user
// @route POST /api/users/login
// @access public
async function loginUser(req, res, next){
  const {email, password} = req.body

  if (!email || !password) {
    res.status(400)
    const err = new Error("User credentials cannot be empty")
    next(err)
    return
  }


  try{
    const user = await UserModel.findOne({email: email})
    if (user && (await bcryptjs.compare(password, user.password))) {
      res
        .status(200)
        .json({
          message: `User logged in successfully`,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            token: getJWTToken(user._id),
          },
        });
    } else {
      res.status(400);
      const err = new Error("Failed to authenticate user");
      next(err);
      return;
    }
  }catch(err){
    res.status(500)
    console.error(err)
    next(new Error("Failed to authenticate user"))
  }
}

// @desc get user
// @route GET /api/users/me/
// @access private  
async function getUser(req, res, next) {
  const user = await UserModel.findOne({_id: req.userId}).select("-password")
  res.status(200).json({user: user})
}

// @desc update user
// @route PUT /api/users/me
// @access private
async function updateUser(req, res, next){
  const {password} = req.body

  if(!password){
    res.status(400)
    next(new Error('Updated credentials cannot be empty'))
    return 
  }
  
  try{
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)
    await UserModel.findOneAndUpdate({_id: req.userId}, {password: hashedPassword})
    res.status(200).json({message: "User credentials updated successfully"})
  }catch(err){
    res.status(500)
    console.log(err)
    next(new Error("Couldn't update user credentials"))
  }
}


// Generate JWT Token (header.payload.verify-signature)
// id ---> using as payload
const getJWTToken = (id) => {
  // jsonwebtoken(payload, SECRET_KEY, options)
  const payload = {id: id}
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d'  // 30 days
  })
}

module.exports = {getUser, registerUser, loginUser, updateUser}