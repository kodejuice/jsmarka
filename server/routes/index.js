let express = require('express');
let router = express.Router();


router.get('/', function(req, res, next) {
    let signedIn = req.isAuthenticated();

    res.render('index', {
        signedIn,
        user: req.user
    });
});

module.exports = router;
