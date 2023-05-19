/**
 * 
 * @param {String} dbName Name of collection
 * @returns 
*/
module.exports = function (dbName) {
    if (!dbName) {
        console.log('Collection name required...');
        process.exit(1);
    }
    const mongoose = require('mongoose');

    const dynamicSchema = new mongoose.Schema({}, {
        strict: false,
        collection: dbName,
        timestamps: {
            createdAt: true,
            updatedAt: false
        },
        versionKey: false
    });

    if (!dynamicModels[dbName]) {
        dynamicModels[dbName] = mongoose.model(dbName, dynamicSchema);
    }
    return dynamicModels[dbName];
}