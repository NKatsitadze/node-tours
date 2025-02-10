const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

const getAllUsers = catchAsync(async (req,res, next) => {
    const users = await User.find()

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    })
})

const createUser = (req,res) => {}

const getUser = (req,res) => { // NEEDS FIX
    const userId = req.params.id
    // const user = users.find(each => each._id === userId)
    if(!user) {
        return res.status(404).json({
                    message: 'User not found',
                    data: null
                })
    }

    res.status(200).json({
        message: 'success',
        data: {
            user
        }
    })
}

const updateMe = catchAsync(async (req,res,next) => {
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('use /updateMyPassword for password update', 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true,  })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
}) 

const updateUser = (req,res) => {}
const deleteUser = (req,res) => {}

const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
  
    res.status(204).json({
      status: 'success',
      data: null
    })
  })

module.exports = {
    getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe
}
