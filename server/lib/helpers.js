
// helper functions

module.exports = ()=>{

	global.isNumber = (str) => {
		let a = (''+str).match(/^[0-9]+$/);
		return a ? !!a[0] : false;
	};

	global.isEmptyString = (str) => {
		str = str.replace(/\n/g, '');
		return !str.length;
	};

	global.isValidSlug = (slug) => {
		let pages = ['index', 'home', 'mytests', 'tests', 'search', 'addtest', 'auth_error', 'sign_out', 'error'];

		return slug.length > 1 && pages.indexOf(slug.toLowerCase()) === -1 && slug.length <= 100;
	};

	// "Hello world" => 'hello-world'
	global.toSlug = (str) => {
		str = str.replace(/[^A-Z0-9_]+/gi, '-').toLowerCase();
		str = str.replace(/^[-]+|[-]+$/g, '');

		return str;
	};

	global.normalizePort = (val) => {
		var port = parseInt(val, 10);

		return port > 0 ? 
			port : false;
	};

	global.err_msg = (msg) => {
		console.error(`\n  error: ${msg} \n`);
		process.exit(1);
	};

};
