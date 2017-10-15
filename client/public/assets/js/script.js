// button clicks handling

// on document load
$($ => {

// sign out button click
$("a#signout").click(function (){
	let $this = $(this);
	$.confirm({
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