# Welcome to RunMe

RunMe is one type of cron jobs, but you can manage cron jobs from UI and check cron job's status in UI, and cron job will run as worker.
You just need to run application it will read your cron job files and display on dashboard and it will start execute on specified time on cron job files, also you can change this time from UI.

# Versions

1). NodeJs >= 12.22.8

2). MongoDB >= 4.0

# Installation and Setup

Here is simple and easy steps of installation and setups.

## Clone repository

First clone repository
> git clone https://github.com/tholiya/runme.git

It will create runme directory, now change the directory to runme

## Install Require Packages

Now install required npm packages.
> npm install

## Set Environment

Create `.env` file from `.env.sample` and add port and database configuration in `.env` file.

## Start Server

Now run below command to start your server it will run on specified port in `.env` file
> npm start

## Login Details
Once server started you need login details to access cron jobs from UI, default login details are as below but you can change password after login.

	Username: runme@site.com
	Password: runme#123

# Cron File Setup

To create cron job you just need to create one js file with some specific format in `schedulers` directory, which is in root directory of application.
There is one `sample.js` file for example in `schedulers` directory.

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

	            resolve(); //set resolve once your execution completed
	        });
	    }
	}
**Note:** You need to `resolve()` promise once your all execution completed, if you resolve promise before execution you may loss data.

You can access your mongoDB database in this cron job file also, with below example, this database will be configuration set by you in `.env` file.

	await db('<collection_name>').find({});
	await db('<collection_name>').aggregate([]);

You can create logs in file, log will be created date wise with cron file name and also you can access this log log from UI.

	logFile.info('From Cron'); //information log
	logFile.error('Error while save data'); //error log
	logFile.error({....}); //you can log object also

# Dev Test

Cron job file will run as worker so you will not able to track console log, so using dev module you can track logs.
You can run dev module with below commands.
- npm run dev 
		- This will give option to select file 
-  node dev
		- This will also give option to select file
-  node dev <file_name>
		- This will execute specified file
		- Ex. `node dev sample.js`


# RunMe Feature

1). **Pause Cron Job**

	- You can pause any single cron, if you pause cron and cron is currently running in that case cron will complete current execution, but it will not start next execution until we play.

2). **PauseAll Cron Jobs**

	- You can pause all cron at a time, if you want to maintain your server in that case you can pause all cron and you can down server, here also if any cron is running then it will complete execution and then it will not start, so we can avoid data loss. 

3). **Check Log From UI**

	- You can add logs in cron job files and also you can check this logs from UI date wise, you will find log icon in cron list in UI.

4). **Change Cron Job Time**

	- You can change cron time from UI by specifying cron string, it will change time instantly you do not need to restart server.  

5). **Set Memory To Cron Job**

	- If your cron jon need extra memory then default memory you can specify memory from UI.

6). **Sync New Cron Job**

	- If you want to add new cron job, so just add file with default format in `schedulers` directory and click on `Sync Cron` button in cron list page from UI, so it will start run instantly.

7). **Real Time Cron Job Status**

	- You can check cron's real time status that cron is running or not, you will found green and red dot in cron list page in UI.
	- Note: If you are using mongoAtlas in that case it will update cron status without page refresh by socket. 