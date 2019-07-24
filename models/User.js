const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name needed.'] },
    email: { type: String, unique: true, required: [true, 'Email needed.'] },
    pass: { type: String, required: [true, 'Password needed.'] },
    avatar: { type: String, required: false },
    date: { type: Date, required: true, default: Date.now }
    // Rest of stuff we put on profile
});

module.exports = mongoose.model('User', userSchema);