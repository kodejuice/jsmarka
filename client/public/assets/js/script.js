// button clicks handling

// on document load
$($ => {

const _$ = $;

// sign out button click
_$("a#signout").click(function (){
	let $this = _$(this);
	_$.confirm({
	    title: 'Sign out!',
	    content: 'Are you sure to continue ?',
	    theme: 'supervan',

	    backgroundDismiss: true,
	    escapeKey: 'cancel',

		icon: 'glyphicon glyphicon-log-out',
        buttons: {
	        confirm() {
	        	location.href = "/sign_out?rdr=" + $this.data('rdr');
	        },
	        cancel() {},
	    }
	});
});


});