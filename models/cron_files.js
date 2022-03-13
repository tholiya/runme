module.exports = function (mongoose) {

    var options = {
        collection: 'cron_files',
        timestamps: {
            createdAt: 'created_on',
            updatedAt: 'updated_on'
        }
    };

    return new mongoose.Schema({
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
    }, options);
};
