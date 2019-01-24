const mongoose = require('mongoose');

//tell mongoose to user promise instade of callback
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/todoapp');


module.exports = {mongoose};
