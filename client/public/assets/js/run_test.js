//////////////////////////////////////////////////////////////////////
// this file is used by browserify to produce the 'bundle.js' file  //
//////////////////////////////////////////////////////////////////////

// handles the `Run test` and `Save test` button click

let bench = {
	oncycle: null,
	teardown: null,
	title: null,
	tests: {},

	suite: null
};

/////////////////////////
// benchmark functions //
/////////////////////////
func('benchmarkCode', 
	(title, fn, async = false) => bench.tests[title] = [fn, async]
);
func('title',
	(title) => bench.title = title
);
func('teardown',
	(fn) => bench.teardown = fn
);
func('oncycle',
	(fn) => bench.oncycle = fn
);

//////////////////
// node modules //
//////////////////
window.beautify = require('js-beautify'); // used in editor.js

const Benchmark = require('benchmark');
const ProgressBar = require('progressbar.js');


//////////
// defs //
//////////
let isRunning = false;
let isSaving = false;

const isModifiable = $$('.modal.runner').attr('data-exec-script') === 'true';    // is the code editor open to modifications
const isEditPage = $$('div[data-edit-test]').html() === 'true';

const signedIn = $$("div[data-signedIn]").html() === 'true';  // is the user logged


///////////////////
// document load //
///////////////////
$($ => {
	const _$ = $;


	// run test button click
	$$('#run_test').click(function (ev){

		// prevent multiple suites running in background
		if (bench.suite && bench.suite.running){
			return;
		}

		isRunning = true;

		// hide `Save test` button at first
		$$('button.test-btn#save_test').hide();

		// get test codes
		let __setupCode = ace.edit('editor1').getValue(),
			__testCode = ace.edit('editor2').getValue(),
			__htmlCode = ace.edit('editor3').getValue();


		// evaluate test code
		if (isModifiable){
			try {
				// add user html code to page
				$$('div#data-html-code').html(__htmlCode);

				// exec code
				eval(__setupCode + __testCode);

				if (Object.keys(bench.tests).length == 0){
					throw "No test case found";
				}
			} catch(e){
				isRunning = false;

				_$.alert({
					title: 'Error',
					content: e+'',
					backgroundDismiss: true,
					theme: 'material'
				});

				setTimeout(_=>{
					$('.modal#runner').modal('hide');
				}, 1);

				return;
			}
		}


		// no tests ?, close dialog and exit
		if (Object.keys(bench.tests).length == 0){
			isRunning = false;
			return closeDialog('No test case found');
			// the `View test` page isn't modifiable
		}


		// clear canvas
		$$('div#canvas').html(`<canvas id='test-result'></canvas>`);

		// clear modal container & info text
		$$('.modal #circle-modal, .modal #current-test').html('');


		///////////////////////
		// bench suite setup //
		///////////////////////

		Benchmark.prototype.setup = __setupCode;
		Benchmark.prototype.teardown = bench.teardown;


		const suite = new Benchmark.Suite;

		bench.suite = suite;

		let testsCount = 0,
			results = [],
			currentTest = 0;


		// add test cases
		for (var t in bench.tests){
			const [fn, async] = bench.tests[t];

			suite.add(t, fn, {
				defer: async
			});

			testsCount += 1;
		}


		//////////////////////////
		// display progress bar //
		//////////////////////////

		const bar = new ProgressBar.Circle("#circle-modal", {
			color: '#aaa',
			strokeWidth: 4,
			trailWidth: 1,
			text: {
				autoStyleContainer: true
			},
			from: { color: '#aaa', width: 1 },
			to: { color: '#24272a', width: 2 },
			step(state, circle) {
				circle.path.setAttribute('stroke', state.color);
				circle.path.setAttribute('stroke-width', state.width);
				circle.setText(~~(circle.value() * 100) + '%');
			}
		});


		////////////////////////
		// bench suite events //
		////////////////////////

		suite.on('start', e => {
			$$('.modal #current-test')
				.html(`Running Benchmark: ${e['currentTarget'][0].name}`);
		});


		// oncycle
		suite.on('cycle', function (e){
			currentTest += 1;

			results.push(e.target + '');

			if (typeof bench.oncycle === 'function'){
				bench.oncycle.call(this, e);
			}

			if (currentTest < testsCount){
				$$('.modal #current-test')
					.html(`Running Benchmark: ${e['currentTarget'][(currentTest)].name}`);
			}

			// advance circle progress
			bar.set(currentTest / testsCount);
			// bar.animate(currentTest / testsCount);
		});


		// oncomplete
		suite.on('complete', function (e){

			isRunning = false;

			// reset tests object
			//  in (index / edit test page) only
			//  ...
			//  the `benchmarkCode` function is not re-invoked in
			//  the `View test` page
			if (isModifiable){
				bench.tests = {};
			}

			$$('.modal #current-test').html('<div center>Operations per second (higher is better)</div>');

			// remove progress bar
			bar.destroy();

			// display close button and save test button
			$$('button.test-btn#close_runner').show();
			$$('button.test-btn#save_test').show();


			/////////////////////////////////
			// display result in bar chart //
			/////////////////////////////////

			const canvas = $('canvas#test-result')[0].getContext('2d');

			let [hzs, labels] = [[], []],
				fastest = -Infinity;

			this.filter(t=>{
				fastest = Math.max(fastest, ~~t.hz);

				hzs.push(~~t.hz);
				labels.push(t.name);
			});


			// display chart
			let chart = new Chart(canvas, {
				type: 'horizontalBar',
				data: {
					labels,
					datasets: [{
						label: `${bench.title || 'Benchmark'} - jsmarka.com`,
						backgroundColor: COLORS,
						borderColor: '#eee',
						data: hzs,
					}]
				},
				options: {
					tooltips: {
						callbacks: {
							footer(item, chart) {
								return results[item[0].index];
							},
							afterFooter(item, start) {
								if (item[0].xLabel === fastest){
									return ' - fastest';
								} else {
									return ` ${Math.round(100 - ((item[0].xLabel / fastest) * 100))}% slower`;
								}
							}
						}
					}
				}
			});
		});


		// run tests
		suite.run({
			async: true
		});

	});




	//////////////////////////////////////////
	// other button clicks and key bindings //
	//////////////////////////////////////////


	// stop benchmark
	$$("button#close_runner").click(function(ev) {
		if (bench.suite)
			bench.suite.abort();
	});


	// run test with "Ctrl+return"
	$$("textarea, html").bind('keydown', "Ctrl+return", function (){
		if (isRunning || isSaving)
			return;

		$$('#run_test').click();
	});


	// "Ctrl+." - use JsMarka as a Scratchpad for your JS code
	$$("textarea, html").bind('keydown', "Ctrl+.", function (){
		if (isRunning || isSaving)
			return;

		if (isModifiable){
			$$('div#data-html-code').html(ace.edit('editor3').getValue());
			try {
				eval(
					ace.edit('editor1').getValue()
					+
					ace.edit('editor2').getValue()
				);
			} catch(e) {
				_$.alert({
					title: 'Error',
					content: e+'',
					backgroundDismiss: true,
					theme: 'material'
				});
			}
		}
	});


	// save tests with "Ctrl+s"
	$$("textarea, html").bind('keydown', 'Ctrl+s', function(e){
		e.preventDefault();

		if (isRunning || isSaving || !isModifiable)
			return;

		// evaluate code
		$$('div#data-html-code').html(ace.edit('editor3').getValue());
		try {
			eval(
				ace.edit('editor1').getValue()
				+
				ace.edit('editor2').getValue()
			);
		} catch(e) {
			return _$.alert({
				title: 'Error',
				content: e+'',
				backgroundDismiss: true,
				theme: 'material'
			});
		}

		if (isEditPage)
			$$('button.edit#save_test').trigger('click');
		else
			$$('button.test-btn#save_test').trigger('click');
	});


	// update user html code on page `onkeypress`
	$(ace.edit('editor3').textInput.getElement()).on('keypress', function(){
		$$('div#data-html-code').html(ace.edit('editor3').getValue());
	});


	//////////////////
	// Saving tests //
	//////////////////

	// `Save test` button click
	$$('button.test-btn#save_test').click(function() {

		if (isSaving || isEditPage)
			return;
		
		isSaving = true;

		if (!bench.title){
			return $.alert("No title set, use the 'title()' function to set the title of your test");
		}

		// get codes
		let jscode1 = entify(ace.edit('editor1').getValue()),
			jscode2 = entify(ace.edit('editor2').getValue()),
			htmlcode = entify(ace.edit('editor3').getValue());

		if (signedIn){

			// save-test dialog
			_$.confirm({
				title: 'Save test',
				content: `
					<form>
						<div class="form-group">
							<label>title</label>
							<input name='title' type='text' value="${bench.title}" class="title form-control" required/>
							<br>
							<label>slug</label>
							<input name='slug' type='text' value="${toSlug(bench.title)}" class="slug form-control" required />

							<div class="checkbox">
								<label>
								  <input class="publish" name="publish" type="checkbox"> Publish test
								</label>
							</div>
						</div>
					</form>
				`,
				buttons: {
					formSubmit: {
						text: 'Submit',
						btnClass: 'btn-dark',
						action() {
							let self = this.$content;

							let slugInput = self.find('input.slug').val();

							let slug = toSlug(slugInput);
							let title = self.find('input.title').val();
							let publish = self.find('input.publish').is(':checked');

							// verify input
							if (!slug.length || !title.length){
								isSaving = false;
								
								return _$.alert({
									title: 'Error',
									content: 'Fill in required fields',
									backgroundDismiss: true,
									theme: 'material'
								});
							}

							// publish test (ajax request)
							let prm = publishTest({
								slug, title,
								jscode1, jscode2, htmlcode,
								publish, slugInput
							});

							prm
							.then(v => {
								$.alert("Test published, redirecting ...");

								window.location = `/${v}`; // redirect to new test url
							})
							.catch(v => {
								$.alert(v);
							});
						}
					},
					cancel() {
						isSaving = false;
					}
				},
				onContentReady() {
					let jc = this;
					let dis = jc.$content;
					let slug = dis.find('input.slug');

					// update slug `on_title_input`
					dis.find('input.title').on('keyup', function() {
						slug.val(toSlug(this.value));
					});

					dis.find('form').on('submit', function (e) {
						e.preventDefault();
						jc.$$formSubmit.trigger('click');
					});
				}
			});
			// end save-test dialog
		} else {
			$.alert({
				title: "Sign in",
				escapeKey: false,
				content: "You must sign in first",
				buttons: {
					ok() {
		            	isSaving  = false;
			        }
				}
			});
		}
	});



	//////////////////////
	// helper functions //
	//////////////////////


	// close test runner dialog
	// with custom message
	function closeDialog(msg){
		_$.alert({
			title: 'Error',
			content: msg,
			backgroundDismiss: true
		});

		return setTimeout(_=>{
			$('.modal#runner').modal('hide');
		}, 1);
	}


	// publish test function
	// TODO: work here
	function publishTest(o){
		return new Promise((resolve, reject)=>{
			_$.confirm({
				content() {
					return $.ajax({
						url: '/addtest',
						method: 'post',
						timeout: 14e3,
						data: {
							originalSlug: o.slugInput,
							slug: o.slug,
							title: o.title,
							jscode1: o.jscode1,
							jscode2: o.jscode2,
							htmlcode: o.htmlcode,
							publish: o.publish
						}
					})
					.done(data => {
						let err;
						if (err = isErrorMessage(data)) {
							reject("Error: " + err);
						}
						else {
							resolve(data); // data => `new-test slug`
						}
					})
					.fail((a, e) => {
						let o = {
							'error': 'try again'
						};

						reject(`Server Error, ${o[e] || e}`);
					});
				},
				contentLoaded(data, status, xhr) {
					isSaving = false;

					this.close(); // we dont need this dialog ^-^
				}
			});
		});
	}


});

