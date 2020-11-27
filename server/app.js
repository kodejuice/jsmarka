
/* global err_msg */

import { Promise as _Promise, connect } from 'mongoose';
	_Promise = Promise;

// connect to DB
connect(process.env.MONGOLAB_URI || 'mongodb://localhost/jsmarka');

// import helper functions
require('./lib/helpers')();

import { readFile } from 'fs';
import express, { static } from 'express';
import { join } from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import cookieSession from 'cookie-session';
import compression from 'compression';
import helmet from 'helmet';
import { Converter } from 'showdown';

// github auth script
import { initialize, session, authenticate } from './auth/github';

// route scripts
import index from './routes/index';
import tests from './routes/tests';
import addtest from './routes/addtest';
import mytests from './routes/mytests';
import search from './routes/search';
import viewtest from './routes/viewtest';
import edit_test from './routes/edit_test';
import delete_test from './routes/delete_test';


let app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');


if (process.env.LOG) {
	app.use(logger('dev'));
}

app.use(favicon(join(__dirname, '../client/public/favicon', 'favicon.ico')));
app.use(compression());
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(static(join(__dirname, '../client/public')));

app.set('trust proxy', 1);
app.use(cookieSession({
	name: 'session',
	keys: ['key1'],
	maxAge: 24 * 60 * 60 * 1000 // 24hrs
}));
app.use(initialize());
app.use(session());

app.get_post = (pth, handler) => app.route(pth).get(handler).post(handler);


/* pass CHANGELOG.md:html to all pages */
app.use((_req, res, next)=>{
	readFile(`${__dirname}/../CHANGELOG.md`, (err, d)=>{
		if (err){
			err_msg(err);
		}

		let converter = new Converter();
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
	authenticate('github', { scope: [ 'user:email' ] })
);

app.get('/auth',
	authenticate('github', { failureRedirect: '/auth/error' }),
	(_req, res) => res.redirect('/')
);


// == error handling == //

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res, _next) => {
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

export default app;
