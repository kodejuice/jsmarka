let express = require('express');
let router = express.Router();

let Test = require('../db/model').tests;


// delete test
router.post('/:test_slug/delete', function(req, res, next) {
	let signedIn = req.isAuthenticated();

	let slug = req.params.test_slug,
		user = signedIn && req.user.username;

	if (signedIn){
		// delete
		Test.deleteOne({slug, user}, (err, r)=>{
			if (err) {
				res.locals.message = err;
				return res.render('error', {
					error: {},
					signedIn,
					user: req.user
				});
			}

			res.redirect('/tests');
		});
	}
	else {
		return res.redirect(`/${slug}`);
	}

});

module.exports = router;
