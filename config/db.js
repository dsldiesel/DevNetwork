const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

//mongoose.connect(db) is promises, let's use async await:
const connectDB = async () => {
  try {
    await mongoose
      .connect(db, {
        // These options will get us rid of some errors in console
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
      })
      .then(function() {
        console.log('Connected to MongoDb.');
      });
  } catch (err) {
    console.log('Error: ' + err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
