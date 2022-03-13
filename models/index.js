/**
 * Script for load db and models
 */
//DB library
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);
//create database connection and compile model schema
let options = {
  socketTimeoutMS: 0,
  connectTimeoutMS: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
};
if (process.env.CLUSTER != undefined && process.env.CLUSTER == 'true') {
  mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + "/" + process.env.DB + "?retryWrites=true", options).catch(error => {
    console.log("Mongo connection error");
    console.log(error)
  });
} else {
  mongoose.connect('mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB + '', options);
}



var dbConnectionData = [];

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
}).forEach(function (file) {
  dbConnectionData[path.parse(file).name] = mongoose.model(path.parse(file).name, require(path.join(__dirname, file))(mongoose));
});

module.exports = function (db_name) {
  if (dbConnectionData[db_name] != undefined) {
    return dbConnectionData[db_name];
  }
  let schema = new mongoose.Schema({}, {
    strict: false,
    collection: db_name,
    timestamps: {
      createdAt: true,
      updatedAt: false
    },
    versionKey: false
  });
  return dbConnectionData[db_name] = mongoose.model(db_name, schema)
};