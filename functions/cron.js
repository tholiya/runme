const CronFiles = require("../models/cron_files");
const CronSettings = require("../models/cron_settings");
module.exports = {
    startCron: async function () {
        var parser = require('cron-parser');
        var moment = require('moment');
        let pausedSetting = await CronSettings.findOne({}, { isPaused: 1 });
        cronData['all'] = false;
        if (pausedSetting) {
            cronData['all'] = pausedSetting.isPaused;
        }
        let getFile = await CronFiles.find({
            status: 'active'
        }, {
            runTime: 1,
            _id: 1,
            fileName: 1,
            memory: 1
        }, { lean: true });
        for (i in getFile) {
            let cronDetail = getFile[i];
            var interval = parser.parseExpression(getFile[i].runTime);
            cronDetail.cronTime = interval.fields;
            cronData[getFile[i]._id] = cronDetail;
        }
        var CronJob = require('cron').CronJob;
        const { exec } = require('child_process');
        new CronJob('* * * * * *', function () {
            if (cronData['all'] == false) {
                let time = moment();
                let second = parseInt(time.format('s'));
                let minute = parseInt(time.format('m'));
                let hour = parseInt(time.format('H'));
                let dayOfMonth = parseInt(time.format('D'));
                let month = parseInt(time.format('M'));
                let dayOfWeek = parseInt(time.format('e'));
                // console.log(second);
                // console.log(minute);
                // console.log(hour);
                for (i in cronData) {
                    if (i != 'all' && ((cronData[i].cronTime.second.length == 1 && cronData[i].cronTime.second[0] == 0) || cronData[i].cronTime.second.includes(second)) && cronData[i].cronTime.minute.includes(minute) && cronData[i].cronTime.hour.includes(hour) && cronData[i].cronTime.dayOfMonth.includes(dayOfMonth) && cronData[i].cronTime.month.includes(month) && cronData[i].cronTime.dayOfWeek.includes(dayOfWeek)) {
                        // console.log(cronData[i].fileName);
                        let string = 'node ./functions/run.js ' + cronData[i]._id + ' ' + cronData[i].fileName;
                        if (cronData[i].memory && cronData[i].memory != 0 && cronData[i].memory != "") {
                            string += ' --max_old_space_size=' + cronData[i].memory;
                        }
                        // console.log(string);
                        exec(string);
                    }
                }
                // console.log('You will see this message every second');
            } else {
                console.log('All cron paused');
            }
        }, null, true).start();
    },

    cronStatus: function (id, logFile) {
        return new Promise(async resolve => {
            let getFile = await CronFiles.findOne({
                _id: id,
                isPaused: false
            });
            if (getFile) {
                getFile = getFile.toObject();
                if (getFile.isOverride == false) {
                    if (getFile.isRunning == true) {
                        logFile.info('Cron Overriding ==========>');
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            } else {
                logFile.info('Cron paused ==========>');
                resolve(false);
            }
        })
    },

    startProcess: function (id) {
        return new Promise(async resolve => {
            await CronFiles.updateOne({
                _id: id
            }, {
                isRunning: true
            });
            resolve();
        });
    },

    endProcess: function (id) {
        return new Promise(async resolve => {
            try {
                await CronFiles.updateOne({
                    _id: id
                }, {
                    isRunning: false
                });
                resolve()
            } catch (e) {
                console.log(e)
                resolve()
            }
        })
    },

    cronLog: function (logName) {
        return require('simple-node-logger').createRollingFileLogger({
            logDirectory: 'logs',
            fileNamePattern: logName + '_<DATE>.log',
            dateFormat: 'YYYY_MM_DD',
            timestampFormat: 'YYYY-MM-DD HH:mm:ss'
        });
    },

    sync: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let fs = require('fs');
                //add cron file in database
                {
                    //read all scheduler file
                    let fileDetails = [];
                    let files = [];
                    fs.readdirSync(__dirname + '/../schedulers').filter(function (file) {
                        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
                    }).forEach(async function (file) {
                        let checkFile = require('../schedulers/' + file);
                        //check validation for format
                        if (checkFile.name && typeof checkFile.name == 'string' && checkFile.defaultRunTime && typeof checkFile.defaultRunTime == 'string' && checkFile.run && typeof checkFile.run == 'function') {
                            //if validation success push to array
                            fileDetails.push({
                                name: checkFile.name,
                                fileName: file,
                                runTime: checkFile.defaultRunTime,
                                status: 'active',
                                isPaused: false,
                                isRunning: false,
                                isOverride: (checkFile.isOverride && checkFile.isOverride == true) ? true : false
                            });
                        } else {
                            console.log("validation failed for " + file)
                        }
                    });
                    var parser = require('cron-parser');
                    for (i in fileDetails) {
                        let count = await CronFiles.countDocuments({ fileName: fileDetails[i].fileName });
                        if(count > 0){
                            delete fileDetails[i].runTime;
                            delete fileDetails[i].isPaused;
                        }
                        //create new record if not exist
                        await CronFiles.updateOne({ fileName: fileDetails[i].fileName }, fileDetails[i], { upsert: true });
                        files.push(fileDetails[i].fileName);
                    }
                    //inactive removed cron
                    await CronFiles.updateMany({
                        fileName: { $nin: files }
                    }, {
                        status: 'inactive',
                        isPaused: true
                    });
                    let pausedSetting = await CronSettings.findOne({}, { isPaused: 1 });
                    let cronDataUpdated = {};
                    cronDataUpdated['all'] = false;
                    if (pausedSetting) {
                        cronDataUpdated['all'] = pausedSetting.isPaused;
                    }
                    let getFile = await CronFiles.find({
                        status: 'active'
                    }, {
                        runTime: 1,
                        _id: 1,
                        fileName: 1,
                        memory: 1
                    }, { lean: true });
                    for (i in getFile) {
                        let cronDetail = getFile[i];
                        var interval = parser.parseExpression(getFile[i].runTime);
                        cronDetail.cronTime = interval.fields;
                        cronDataUpdated[getFile[i]._id] = cronDetail;
                    }
                    cronData = cronDataUpdated
                    console.log('New file added.');
                }
                resolve();
            } catch (error) {
                console.log('Error in initial script');
                console.log(error);
                reject(error);
            }
        })
    }
}