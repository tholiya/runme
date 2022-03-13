require('custom-env').env();
global.db = require('./models');
const cliSelect = require('cli-select');
const runFunction = require('./dev/run');
let runDev = new runFunction();
if (process.argv[2] != undefined) {
    (async function () {
        let checkFile = require('./schedulers/' + process.argv[2]);
        //check validation for format
        if (checkFile.name && typeof checkFile.name == 'string' && checkFile.defaultRunTime && typeof checkFile.defaultRunTime == 'string' && checkFile.run && typeof checkFile.run == 'function') {
            //if validation success push to array
            console.log('Started Execution : ' + process.argv[2]);
            await runDev.run(process.argv[2])
            console.log('Completed Execution : ' + process.argv[2]);
            setTimeout(function () {
                process.exit(0);
            }, 2000);
        } else {
            console.log("validation failed for " + process.argv[2]);
            process.exit(0);
        }
    }());
} else {
    let fs = require('fs');
    let fileDetails = [];
    fs.readdirSync(__dirname + '/schedulers').filter(function (file) {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
    }).forEach(async function (file) {
        let checkFile = require('./schedulers/' + file);
        //check validation for format
        if (checkFile.name && typeof checkFile.name == 'string' && checkFile.defaultRunTime && typeof checkFile.defaultRunTime == 'string' && checkFile.run && typeof checkFile.run == 'function') {
            //if validation success push to array
            fileDetails.push(file);
        } else {
            console.log("validation failed for " + file)
        }
    });


    cliSelect({
        values: fileDetails
    }).then(async (response) => {
        console.log('selected : ' + response.value);
        console.log('Started Execution : ' + response.value);
        await runDev.run(response.value)
        console.log('Completed Execution : ' + response.value);
        setTimeout(function () {
            process.exit(0);
        }, 2000);
    }).catch(() => {
        console.log('cancelled selection');
        process.exit(0);
    });
}