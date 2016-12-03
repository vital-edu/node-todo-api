const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);

module.exports = {mongoose}