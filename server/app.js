
/* global err_msg */

let mongoose = require('mongoose');
	mongoose.Promise = Promise;

// connect to DB
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/jsmarka', {
	useMongoClient: true
});

// import helper functions
require('./lib/helpers')();

let fs = require('fs');
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let cookieSession = require('cookie-session');
let compression = require('compression');
let helmet = require('helmet');
let showdown = require('showdown');

// github auth script
let passport = require('./auth/github');

// route scripts
let index = require('./routes/index');
let tests = require('./routes/tests');
let addtest = require('./routes/addtest');
let mytests = require('./routes/mytests');
let search = require('./routes/search');
let viewtest = require('./routes/viewtest');
let edit_test = require('./routes/edit_test');
let delete_test = require('./routes/delete_test');


let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


if (process.env.LOG) {
	app.use(logger('dev'));
}

app.use(favicon(path.join(__dirname, '../client/public/favicon', 'favicon.ico')));
app.use(compression());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/public')));

app.set('trust proxy', 1);
app.use(cookieSession({
	name: 'session',
	keys: ['key1'],
	maxAge: 24 * 60 * 60 * 1000 // 24hrs
}));
app.use(passport.initialize());
app.use(passport.session());

app.get_post = (pth, handler) => app.route(pth).get(handler).post(handler);


/* pass CHANGELOG.md:html to all pages */
app.use((req, res, next)=>{
	fs.readFile(`${__dirname}/../CHANGELOG.md`, (err, d)=>{
		if (err){
			err_msg(err);
		}

		let converter = new showdown.Converter();
        converter.setFlavor('github');

		let	html = converter.makeHtml(d+'');

		res.locals.changelogHTML = html;
		next();
	});
});

// == Pages routing == //

// home page
app.get_post('/', index);

// _____ tests
app.get_post('/tests', tests);
app.get_post('/mytests', mytests);
app.post('/addtest', addtest);
app.post('/:test_slug/delete', delete_test);

// search tests
app.get_post('/search', search);

// sign out
app.get('/sign_out', (req, res)=>{
	if (req.isAuthenticated())
		req.logout();
	res.redirect(req.query.rdr || '/');
});

// view test
app.get_post('/:test_slug', viewtest);

// edit test
app.post('/:test_slug/edit', edit_test)
	.get('/:test_slug/edit', edit_test);


// ** Github auth route ** //

app.get('/auth/error', (req, res)=>{
	if (!req.isAuthenticated()){
		res.render('auth_error');
	}
	else {
		res.redirect('/');
	}
});

app.get('/auth/github',
	passport.authenticate('github', { scope: [ 'user:email' ] })
);

app.get('/auth',
	passport.authenticate('github', { failureRedirect: '/auth/error' }),
	(req, res) => res.redirect('/')
);


// == error handling == //

// catch 404 and forward to error handler
app.use((req, res, next) => {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', {
		user: req.user,
		signedIn: req.isAuthenticated()
	});
});

module.exports = app;
