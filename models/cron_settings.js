module.exports = function (mongoose) {

    var options = {
        collection: 'cron_settings',
        timestamps: {
            createdAt: 'created_on',
            updatedAt: 'updated_on'
        }
    };

    return new mongoose.Schema({
        isPaused:{
            type:Boolean,
            default:false
        }
    }, options);
};
