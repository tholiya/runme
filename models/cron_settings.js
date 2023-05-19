const mongoose = require('mongoose');

const cronSettingsSchema = new mongoose.Schema({
    isPaused:{
        type:Boolean,
        default:false
    }
},{
    timestamps: {
        createdAt: 'created_on',
        updatedAt: 'updated_on'
    }
});

const cronSettings = mongoose.model('cron_settings', cronSettingsSchema)

module.exports = cronSettings
