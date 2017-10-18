let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let searchPlugin = require('mongoose-search-plugin');

// create Test & User Schema

// user
let UserSchema = new Schema({
	user_id: String,

	name: String,
	email: String,
	username: String
});

// test
let TestSchema = new Schema({
	date: Date,
	last_modified: Date,

	user: String,
	slug: String,
	title: String,

	html_code: String,
	js_code1: String,
	js_code2: String,

	views: Number,
	publish: Boolean
});

TestSchema.plugin(searchPlugin, {
	fields: ['title', 'user', 'slug', 'html_code']
});


// export model
module.exports = {
	tests: mongoose.model('tests', TestSchema),
	users: mongoose.model('users', UserSchema)
};
