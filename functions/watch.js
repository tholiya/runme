const CronFiles = require("../models/cron_files");
module.exports = {
    start: async function () {
        try {
            CronFiles.watch([{
                $match: {
                    $and: [
                        { "updateDescription.updatedFields.isRunning": { $exists: true } },
                        { operationType: "update" }]
                }
            }], { fullDocument: 'updateLookup' }).on('change', data => {
                socketFn.sendCronStatusEvent({
                    id: data.fullDocument._id.toString(),
                    isRunning: data.fullDocument.isRunning
                });
            });
            console.log('Watch started')
        } catch (err) {
            console.log('Watch disable')
        }
    }
}