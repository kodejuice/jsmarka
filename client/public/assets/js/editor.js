// code editor setup
//  and some button clicks handling

// on document load
$(document).ready($ => {

	let hiddenElm1_code = deentify($$("[hidden]#code-1").html()); // js1
	let hiddenElm2_code = deentify($$("[hidden]#code-2").html()); // js2
	let hiddenElm3_code = $$("[hidden]#code-3").html();           // html


	// set editor content to previous session value
	//  or default content
	let code1 = !isEmpty(cache('editor1')) ? cache('editor1') : hiddenElm1_code;
	let code2 = !isEmpty(cache('editor2')) ? cache('editor2') : hiddenElm2_code;
	let code3 = !isEmpty(cache('editor3')) ? entify(cache('editor3')) : hiddenElm3_code;


	let isModifiable = $$(".modal.runner").attr('data-exec-script') === 'true';  // is the code editor open to modifications
	let isEditPage = $$('div[data-edit-test]').html() === 'true';

	if (isModifiable && !isEditPage){
		$$("#editor1").html(code1);
		$$("#editor2").html(code2);
		$$("#editor3").html(code3);
	}


	// initialize code editors
	const editors = [ace.edit("editor1"), ace.edit("editor2"), ace.edit("editor3")];
	const [editor1, editor2, editor3] = [editors[0], editors[1], editors[2]];

	// available editor themes
	let themes = [
			"clouds_midnight",
			"github",
			"gruvbox",
			"mono_industrial",
			"solarized_dark",
			"terminal",
			"tomorrow",
			"xcode",
			"monokai"
		],
	ptr = 0;

	// configure editors
	editors.forEach((e, i) => {
		// set first two editors mode to javascript
		//  and the third 'xml'
		e.getSession().setMode(`ace/mode/${(i<2) ? 'javascript' : 'xml'}`);

		// set all theme at once here
		// so it would be cached for later changing
		themes.map(thm => e.setTheme(`ace/theme/${thm}`));

		// set final theme from cache if its cached
		//  else use 'monokai'
		e.setTheme(`ace/theme/${cache('theme') || 'monokai'}`);

		e.setFontSize(15);

		// cache editor content `oncontentchange`
		e.on('change', ()=>{
			if (isModifiable && !isEditPage)
				cache(`editor${i+1}`, e.getValue());
		});

		if (!isModifiable)
			e.setReadOnly(true);
	});


	//  toggle buttons
	let t_buttons = $$("#toggle_buttons");

	// toggle html/js button click
	t_buttons.find("button").click(function(){
		let index = +$(this).data('index'); // 0, 1
		let toggle = (index + 1) % 2; // 0=>1, 1=>0

		if ($(this).hasClass('btn-primary'))
			return; // button already active

		// make current button active & deactivate other button
		$(this).addClass('btn-primary');
		t_buttons.find(`button:eq(${toggle})`).removeClass('btn-primary');

		// hide current editor & display other
		$$(`.code[data-index=${toggle}]`).hide();
		$$(`.code[data-index=${index}]`).show();
	});


	// `Change theme` button click
	$$("button#change_theme").click(() => {
		editor1.setTheme(`ace/theme/${themes[ptr]}`);
		editor2.setTheme(`ace/theme/${themes[ptr]}`);
		editor3.setTheme(`ace/theme/${themes[ptr]}`);

		// cache changed theme
		cache("theme", themes[ptr]);

		// increment pointer
		ptr = (ptr + 1) % themes.length;
	});


	// reset editor button click
	$$("#reset_editor").click(()=>{
		$.confirm({
			title: 'Reset?',
			content: 'Reset editors to thier default content ?',
			theme: 'material',

			backgroundDismiss: true,

			icon: 'glyphicon glyphicon-refresh',
			buttons: {
				confirm() {
					editor1.setValue(hiddenElm1_code);
					editor2.setValue(hiddenElm2_code);
					editor3.setValue(deentify(hiddenElm3_code));
				},
				cancel() {},
			}
		}); 
	});

});

