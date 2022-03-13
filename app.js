//set environment
require('custom-env').env();
global.db = require('./models');
global.cronData = {};
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
const session = require('express-session');
const cookieSession = require('cookie-session');
const flash = require('connect-flash');
const fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dashboardRouter = require('./routes/dashboard');
var cronsRouter = require('./routes/crons');

var app = express();

// view engine setup
const hbs = exphbs.create(require('./helpers/handlebar.js'));
// view engine setup
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

var uploadDirs = ['./logs'];
for (inx in uploadDirs) {
  if (!fs.existsSync(uploadDirs[inx])) {
    fs.mkdirSync(uploadDirs[inx]);
  }
}
// app.use(logger('dev'));
app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  extended: false,
  limit: '50mb'
}));
app.use(cookieSession({
  secret: "session",
  key: process.env.SECRET,
}));
//express session
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
  maxAge: Date.now() + 30 * 86400 * 1000,
  cookie: { secure: true }
}));
//use connect flash
app.use(flash());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (process.env.APP_ENV == 'production' && (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.svg'))) {
      res.setHeader('Cache-Control', 'max-age=79200');
    }
  },
}));

let socketFunctions = require("./common/socket");
global.socketFn = new socketFunctions();
(async function(){
  await require('./functions/initial');
  if (process.env.CLUSTER != undefined && process.env.CLUSTER == 'true') {
    require('./functions/watch').start();
  }
  require('./functions/cron').startCron();
})()


const {
  commonMiddelware,
  flashMiddelware
} = require("./common/middleware");
//set passport auth
const auth = require('./helpers/auth');
auth.login(app);

//set middelware
app.use(commonMiddelware);
app.use(flashMiddelware);

//set routes
app.use('/', indexRouter);
//check auth
app.use(auth.checkAuth);
// app.use('/users', usersRouter);
app.use('/dashboard', dashboardRouter);
app.use('/crons', cronsRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.APP_ENV === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error',{
    layout:'error'
  });
});

module.exports = app;
