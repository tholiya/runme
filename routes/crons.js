var express = require('express');
var router = express.Router();
var { paginationSort } = require('../common/middleware');
const glob = require("glob");
const fs = require("fs");
const CronFiles = require("../models/cron_files");
const CronSettings = require("../models/cron_settings");

/* GET home page. */
router.get('/', paginationSort, async function (req, res, next) {
	let crons = await CronFiles.find({}, {}, { lean: true }).sort(req.pageSort.sort).skip(req.pageSort.skip).limit(req.pageSort.limit);
	let cronCount = await CronFiles.countDocuments();
	let pausedSetting = await CronSettings.findOne({}, { isPaused: 1 });
	if (pausedSetting) {
		pausedSetting = pausedSetting.toObject();
	}
	res.render('crons/index', {
		title: 'Crons',
		crons,
		pausedSetting: pausedSetting,
		pagination: {
			limit: req.pageSort.limit,
			page: req.pageSort.page,
			total: cronCount,
			url: req.originalUrl
		}
	});
});

router.post('/play-pause', async function (req, res, next) {
	try {
		let isPaused = req.body.status == 'false' ? false : true;
		let update = await CronFiles.updateOne({
			_id: req.body.id
		}, {
			isPaused: isPaused
		});
		if (update && update.modifiedCount == 1) {
			res.send({ type: 'success', message: 'Cron status updated' });
		} else {
			res.send({ type: 'error', message: 'Error while update status' });
		}
	} catch (error) {
		res.send({ type: 'error', message: error.message });
	}
});

router.post('/play-pause-all', async function (req, res, next) {
	try {
		let update = await CronSettings.updateOne({
		}, {
			isPaused: req.body.status
		}, { upsert: true });
		let pausedSetting = await CronSettings.findOne({}, { isPaused: 1 });
		cronData['all'] = pausedSetting.isPaused;
		if (update) {
			res.send({ type: 'success', message: 'Cron status updated' });
		} else {
			res.send({ type: 'error', message: 'Error while update status' });
		}
	} catch (error) {
		res.send({ type: 'error', message: error.message });
	}
});

router.get('/edit/:id', async function (req, res, next) {
	let cron = await CronFiles.findOne({
		_id: req.params.id
	}, {});
	res.render('crons/edit', {
		title: 'Edit Crons',
		cron: cron.toObject(),
	});
});

router.post('/edit/:id', async function (req, res, next) {
	try {
		var parser = require('cron-parser');
		await CronFiles.updateOne({
			_id: req.params.id
		}, req.body);
		var interval = parser.parseExpression(req.body.runTime);
		cronData[req.params.id].cronTime = interval.fields;
		cronData[req.params.id].memory = req.body.memory;
		req.flash('success', 'Cron details updated successfully');
		return res.redirect('/crons');
	} catch (error) {
		console.log(error)
		req.flash('error', 'Error while update cron details');
		return res.redirect('back');
	}
});

router.post('/validate', async function (req, res, next) {
	try {
		const cron = require('cron-validator');
		res.send(cron.isValidCron(req.body.string, { seconds: true }));
	} catch (error) {
		res.send(false);
	}
});

router.post('/sync-cron', async function (req, res, next) {
	try {
		await require('../functions/cron').sync();
		res.send({ type: 'success', message: 'Cron sync process completed' });
	} catch (error) {
		res.send({ type: 'error', message: 'Error while sync' });
	}
});

router.get('/logs/:file_name', paginationSort, async function (req, res, next) {
	glob("logs/" + req.params.file_name + "_[1-9][0-9][0-9][0-9]_[0-1][0-9]_[0-3][0-9].log", {}, function (err, files) {
		if (err) {
			res.render('crons/logs', {
				title: 'Crons Log',
				filenames,
				file_name: req.params.file_name
			});
		} else {
			let filenames = [];
			for (let i in files) {
				let temp = files[i].split('/');
				filenames.push(temp[1]);
			}
			filenames.reverse();
			//render page with data
			res.render('crons/logs', {
				title: 'Crons Log',
				filenames,
				file_name: req.params.file_name
			});
		}
	});
});

/**
 * Read file and send to client side as response
 */
router.get('/logs/fullpage/:filename', function (req, res, next) {
	//open file in read mode 
	fs.readFile('./logs/' + req.params.filename, function (err, data) {
		if (err) {
			res.render('crons/fullpage', {
				fileDetailed: '',
				layout: 'blank'
			});
		} else {
			//converts data into string from buffer
			let file = data.toString();
			//render the page
			res.render('crons/fullpage', {
				fileDetailed: file,
				layout: 'blank'
			});
		}
	});
});
module.exports = router;
