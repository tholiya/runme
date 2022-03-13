module.exports = {
    startCron: async function () {
        var parser = require('cron-parser');
        var moment = require('moment');
        let pausedSetting = await db('cron_settings').findOne({}, { isPaused: 1 });
        cronData['all'] = false;
        if (pausedSetting) {
            cronData['all'] = pausedSetting.isPaused;
        }
        let getFile = await db('cron_files').find({
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

    start: async function () {
        const pm2 = require('pm2');
        //get cron file list
        let getFile = await db('cron_files').find({}, {}, { lean: true });
        try {
            if (getFile.length > 0) {
                //if file found
                pm2.connect(function (err) {
                    if (err) {
                        console.error(err)
                        process.exit(2)
                    }
                    let inx = 0;
                    //async Loop through each file
                    (async function dataLoop() {
                        if (inx < getFile.length) {
                            if (getFile[inx].status == 'active') {
                                //start pm2 process
                                pm2.start({
                                    script: 'node ./functions/run.js ' + getFile[inx]._id + ' ' + getFile[inx].fileName,
                                    name: getFile[inx].fileName,
                                    cron_restart: getFile[inx].runTime,
                                    log_date_format: "YYYY-MM-DD HH:mm Z",
                                    autorestart: false,
                                    env: {
                                        DB_USER: process.env.DB_USER,
                                        DB_PASSWORD: process.env.DB_PASSWORD,
                                        DB_HOST: process.env.DB_HOST,
                                        DB_PORT: process.env.DB_PORT,
                                        DB: process.env.DB
                                    }
                                }, function (err, apps) {
                                    // console.log(apps);
                                    //go for next file
                                    inx++;
                                    dataLoop();
                                });
                            } else {
                                //delete inactive cron
                                pm2.delete(getFile[inx].fileName, function (err, apps) {
                                    //go for next file
                                    inx++;
                                    dataLoop();
                                })
                            }

                        } else {
                            //disconnect pm2
                            pm2.disconnect();
                        }
                    }());
                })
            } else {
                console.log('No cron found')
            }
        } catch (error) {
            console.log(error)
        }
    },

    cronStatus: function (id, logFile) {
        return new Promise(async resolve => {
            let getFile = await db('cron_files').findOne({
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
            await db('cron_files').updateOne({
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
                await db('cron_files').updateOne({
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
                        let count = await db('cron_files').countDocuments({ fileName: fileDetails[i].fileName });
                        if(count > 0){
                            delete fileDetails[i].runTime;
                            delete fileDetails[i].isPaused;
                        }
                        //create new record if not exist
                        await db('cron_files').updateOne({ fileName: fileDetails[i].fileName }, fileDetails[i], { upsert: true });
                        files.push(fileDetails[i].fileName);
                    }
                    //inactive removed cron
                    await db('cron_files').updateMany({
                        fileName: { $nin: files }
                    }, {
                        status: 'inactive',
                        isPaused: true
                    });
                    let pausedSetting = await db('cron_settings').findOne({}, { isPaused: 1 });
                    let cronDataUpdated = {};
                    cronDataUpdated['all'] = false;
                    if (pausedSetting) {
                        cronDataUpdated['all'] = pausedSetting.isPaused;
                    }
                    let getFile = await db('cron_files').find({
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