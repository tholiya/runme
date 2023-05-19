const DynamicCollection = require("../models/dynamic");
const CronFiles = require("../models/cron_files");
module.exports = async function () {
    return new Promise(async resolve => {
        try {

            //check for cron user and if not availabe create cron user
            {
                //check any users are available or not
                let usersCount = await DynamicCollection('cron_user').countDocuments({
                    status: 'active',
                    deleted: false
                });
                if (usersCount == 0) {
                    //if any user not availabe create one user
                    let saltedSha512 = require('salted-sha512');
                    await DynamicCollection('cron_user').create({
                        name: 'Runme Admin',
                        email: 'runme@site.com',
                        phone: '9999999999',
                        password: saltedSha512('runme#123', process.env.SALTKEY),
                        status: 'active',
                        deleted: false
                    });
                    console.log("Default user created");
                }
            }
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

                for (i in fileDetails) {
                    let count = await CronFiles.countDocuments({ fileName: fileDetails[i].fileName });
                    if(count > 0){
                        delete fileDetails[i].runTime;
                        delete fileDetails[i].isPaused;
                    }
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
                await CronFiles.updateMany({}, {
                    isRunning: false
                });
                console.log('New file added.');
            }
            resolve();
        } catch (error) {
            console.log('Error in initial script');
            console.log(error);
            resolve();
        }
    })
}();