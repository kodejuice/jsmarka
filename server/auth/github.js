let passport = require('passport');
let GitHubStrategy = require('passport-github2').Strategy;

let Users = require('../db/model').users;


passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Users.findById(id, function (err, user) {
		done(err, user);
    });
});


passport.use(new GitHubStrategy({
	clientID: process.env.GITHUB_clientID,
	clientSecret: process.env.GITHUB_clientSECRET,
	callbackURL: process.env.GITHUB_callbackURL
  },
  (accessToken, refreshToken, profile, done) => {
	process.nextTick(function () {

	    let searchQuery = {
			username: profile.username
	    };

		let updates = {
			user_id: profile.id,
			name: profile.displayName,
			email: profile._json.email,
			username: profile.username
		};

		// update the user if they exists or add a new user
		Users.findOneAndUpdate(searchQuery, updates, { upsert: true }, function(err, user) {
			if(err) {
			    return done(err);
		    } else {
			    return done(null, user);
		    }
		});
	});
  }
));

module.exports = passport;
