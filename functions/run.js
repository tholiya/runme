require('custom-env').env();
var _this;
require('../models/dbConnection');
let {cronStatus, startProcess, endProcess, cronLog} = require('./cron');
var logFile = cronLog(process.argv[3]);
class runFunction {
    run() {
		return new Promise(async resolve=>{
			let cron = require('../schedulers/'+process.argv[3]);
            await cron.run(logFile);
            resolve();
		});
    };

	/**
	 * constructor
	 */
	 constructor() {
		_this = this;
		(async function(){
			let status = await cronStatus(process.argv[2], logFile);
			if(status){
				logFile.info('Cron Started');
				await startProcess(process.argv[2])
				await _this.run();
			}
			setTimeout(async function(){
				logFile.info('Cron Completed');
				await endProcess(process.argv[2]);
            	process.exit(0);
			},2000);
		}());
	};
}

new runFunction();