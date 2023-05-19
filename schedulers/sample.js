module.exports = {
    name: 'Sample Cron File', //cron name
    defaultRunTime: '10 * * * * *', //erevy 10th second
    isOverride: false, // false => cron will not override
    run: async function (logFile) {
        return new Promise(resolve => {

            logFile.info('From Cron'); //to create file log

            /**
             * Your logic goes here 
             */
            setTimeout(function(){
                resolve(); //set resolve once your execution completed
            },5000);
        });
    }
}