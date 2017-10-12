
// helper functions

module.exports = ()=>{

	global.isEmptyString = (str) => {
		str = str.replace(/\n/g, '');
		return !str.length;
	}

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

};
