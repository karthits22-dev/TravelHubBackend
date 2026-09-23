const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const registerUser = async (req, res) => {
  try {
    const { name, email, password, phonenumber } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      console.log( await User.findOne({ email }))
      return res.status(400).json({
        message: 'User already exists'
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      hashedPassword,
      phonenumber
    });

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name:user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,

    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    // check user exists
    const user = await User.findOne({ email });

    if (email!==user.email) {
      return res.status(404).json({
        message: 'Email not found'
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    return res.status(200).json({
      message: 'Login successful',
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("UPDATEUSE",id)

    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,          // return updated data
        runValidators: true // validate schema
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json({
      message: 'User updated successfully',
      updatedUser
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const deleteUser = async (req, res) => {

  console.log("RES",res,req)
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      res.status(404).json({
        message: 'No data found',
       
      });
    }


    res.status(200).json({
     
      message: 'User from user data ',
      users
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { registerUser, getUsers,deleteUser,updateUser,loginUser };