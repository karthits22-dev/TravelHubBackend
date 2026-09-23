const express = require('express');
const router = express.Router();

const { registerUser,getUsers,deleteUser,updateUser,loginUser } = require('../Controllers/userController');





router.post('/register', registerUser);
router.get('/list', getUsers);
router.delete('/delete-user/:id', deleteUser);
router.put('/update-user/:id', updateUser);
router.post('/login', loginUser);


module.exports = router;