
const $cache = {}; // for caching jQuery DOM objects

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

const _$ = $;

// a function to define read-only functions
Object.defineProperty(window, 'func', {
	value: (name, value) => {
		Object.defineProperty(window, name, {value});
	}
});


// `error: message`
func('isErrorMessage', (msg) =>
	msg.match(/error:/i) ? msg.split(':')[1] : false
);


// "Hello world" => 'hello-world'
func('toSlug', (str)=>{
	str = str.replace(/[^A-Z0-9_]+/gi, '-').toLowerCase();
	str = str.replace(/^[-]+|[-]+$/g, '');

	return str;
});


// load javascript file via url
//  and inject source into page
func('loadScript', (url, fn)=>{
	let failed = null;

	$.ajax(url, {
		// dataType: 'jsonp',
		cache: true,
		async: false,
		success (a){
			// add script to page
			let script = document.createElement('script');
				script.innerHTML = a;
			$$('head').append(script);

			fn.call(fn, a, this);
		},
		error (){
			failed = url;
		}
	}).always(()=>{
		if (failed){
			_$.alert({
				title: 'Unable to load scripts',
	            content: `Failed to load \n ${failed}`,
	            theme: 'material',
	            backgroundDismiss: true
			});
		}
	});

});


// random number generator
func('rand', (frm = 0, to = frm + 10) =>
	~~(Math.random() * (to - frm)) + frm
);


// cache each call to $()
func('$$', (sel) =>
	$cache[sel] || ($cache[sel] = _$(sel))
);


// &lt; => '<'
// &gt; => '>'
func('deentify', (str) =>
	str ? str.replace(/&lt;/g, '<').replace(/&gt;/g, '>') : ""
);


// < => '&lt;'
// > => '&gt;'
func('entify', (str) =>
	str ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ""
);


// check if input is whitespace or falsy
func('isEmpty', (v)=>{
	if (typeof v === 'string'){
		v = v.replace(/\n+/g, '');

		return !v.length;
	}
	return !v;
});


// item cache
//  use localStorage as cache
func('cache', (key, val) =>
	val ? localStorage.setItem(key, val) :
		localStorage.getItem(key)
);

/////////////////
// end HELPERS //
/////////////////


// generate random list of background colors
//  used for the bar chart
const COLORS = [];
while (COLORS.length < 100) {
	COLORS.push(`rgb(${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)})`);
}

// shuffle colors
COLORS.sort(() => [-1, 0, 1][rand(0, 2)]);
