module.exports = {
    start: async function () {
        console.log('Watching started')
        db('cron_files').watch([{
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
    }
}