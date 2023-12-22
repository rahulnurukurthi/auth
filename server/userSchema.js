const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  loginAttempts: { type: Number, default: 0 },
});

const User = mongoose.model('UserData', UserSchema);

module.exports = User;
