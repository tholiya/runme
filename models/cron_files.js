const mongoose = require('mongoose');

const cronFilesSchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    fileName: {
        type: String
    },
    runTime:{
        type: String
    },
    status:{
        type: String
    },
    memory:{
        type: String
    },
    isPaused:{
        type:Boolean,
        default:false
    },
    isRunning:{
        type:Boolean,
        default:false
    },
    isOverride:{
        type:Boolean,
        default:false
    }
},{
    timestamps: {
        createdAt: 'created_on',
        updatedAt: 'updated_on'
    }
})

const cronFiles = mongoose.model('cron_files', cronFilesSchema)

module.exports = cronFiles
