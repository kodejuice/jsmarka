// test defs

module.exports = {
	/* jsmarka default port */
	PORT: "3000",

	/* phantomjs viewPort size */
	view: {
		width: 1300,
		height: 800
	},

	/* screenshoot page */
	snap: function(casper, path){
		casper.capture(path);

		console.log("Took a snapshot => '"+path+"'\n");
	}

};
