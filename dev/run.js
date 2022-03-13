var _this;
var logFile = null;
class runFunction {
	run(fileName) {
		return new Promise(async resolve => {
			logFile = this.cronLog(fileName);
			logFile.info('Cron Started');
			let cron = require('../schedulers/' + fileName);
			await cron.run(logFile);
			logFile.info('Cron Completed');
			resolve();
		});
	};

	cronLog (logName) {
        return require('simple-node-logger').createRollingFileLogger({
            logDirectory: 'logs',
            fileNamePattern: logName + '_dev_<DATE>.log',
            dateFormat: 'YYYY_MM_DD',
            timestampFormat: 'YYYY-MM-DD HH:mm:ss'
        });
    };
}

module.exports = runFunction;