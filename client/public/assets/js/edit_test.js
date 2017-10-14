//////////////////////////////////////////////////////////////////////
// this file is used by browserify to produce the 'bundle.js' file  //
//////////////////////////////////////////////////////////////////////


// handles the `Save test` button click in the `Edit test` page

$($ => {

	const _$ = $;
	let isSaving = false;

	const signedIn = $$("div[data-signedIn]").html() === 'true';

	// test details
	const title = $$('div[data-title]').html(),
		slug = $$('div[data-slug]').html(),

		publish = $$('div[data-published]').html(),
		author = $$('div[data-author]').html(),

	signedInUser = signedIn ? $$('div[data-user]').html() : "";


	// `Save test` button click
	$$('button.edit#save_test').click(function(ev) {
		ev.stopPropagation();

		if (isSaving)
			return;

		isSaving = true;

		// get codes
		let jscode1 = entify(ace.edit('editor1').getValue()),
			jscode2 = entify(ace.edit('editor2').getValue()),
			htmlcode = entify(ace.edit('editor3').getValue());


		if (signedIn){
			// save-test dialog
			_$.confirm({
				title: 'Save edits',
				content: `
					<form>
						<div class="form-group">
							<label>title</label>
							<input name='title' type='text' value="${title}" class="title form-control" required/>
							<br>
							${(author !== signedInUser) ? 
								'<label>new slug</label>\
								<input name="slug" type="text" value="'+slug+'" class="slug form-control" required />'
							: ""}

							<div class="checkbox">
								<label>
								  <input class="publish" name="publish" type="checkbox" checked='${!!publish}'> Publish test
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

							let isOwner = author === signedInUser;

							let [slugInput, new_slug] = [null, null];

							// if it's not the owner of the test
							//  then this is a fork, get new slug
							if (!isOwner){
								slugInput = self.find('input.slug').val();
								new_slug = toSlug(slugInput);								
							}

							let new_title = self.find('input.title').val();
							let publish = self.find('input.publish').is(':checked');

							// verify input
							if ((!isOwner && !new_slug.length) || !new_title.length){
								isSaving = false;

								return _$.alert({
									title: 'Error',
									content: 'Fill in required fields',
									backgroundDismiss: true,
									theme: 'material'
								});
							}

							// edit test (ajax request)
							let prm = editTest({
								slug, new_slug, new_title,
								jscode1, jscode2, htmlcode,
								publish, slugInput
							});

							prm
							.then(v => {
								$.alert("Test edited, redirecting ...");

								window.location = `/${new_slug ? toSlug(new_slug) : slug}`;
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



	////////////
	// helper //
	////////////


	// edit test function
	function editTest(o){
		return new Promise((resolve, reject)=>{
			_$.confirm({
				content() {
					return $.ajax({
						url: `/${o.slug}/edit`,
						method: 'post',
						timeout: 14e3,
						data: {
							slug: o.new_slug,
							title: o.new_title,

							js_code1: o.jscode1,
							js_code2: o.jscode2,
							html_code: o.htmlcode,

							publish: o.publish,
							slugInput: o.slugInput
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
					
					this.close();
				}
			});
		});
	}



});

