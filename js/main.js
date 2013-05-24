Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var LoginView = Parse.View.extend({

	el: "#content",

	events: {
		"click #login_button": 	"login",
		"click #signup_button": 	"signUpp",
	},

	initialize: function() {
		window.location.hash = "#login";
		this.render();
	},

	render: function() {
		var html = tpl.get('login');//  $('#loginTemplate').html();
		this.$el.empty();
		this.$el.append(html);

		$.getScript("js/kickstart.js");
			/*.done(function(script, textStatus) {
			  console.log( textStatus );
			})
			.fail(function(jqxhr, settings, exception) {
			  console.log( exception );
			});*/
	},


	login: function() {
		clearError();
		displayMessage("Sending login information ...");
		var username = this.$el.find("#username").val();
		var password = this.$el.find("#password").val();
		
		Parse.User.logIn(username, password, {
			success: function(user) {
				clearMessage();
				$("#errormessage").append("login successfull");
				new BookListView();
			},	
			error: function(user, error) {
				clearMessage();
				displayError(error.message);
			}
		});
	},

	signup: function() {
		clearError();
		displayMessage("Sending signup information ...");
		var username = this.$el.find("#su_username").val();
		var password = this.$el.find("#su_password").val();
		var email = this.$el.find("#su_email").val();

		var user = new Parse.User();
		user.set("username", username);
		user.set("password", password);
		user.set("email", email);
		
		user.signUp(null, {
			success: function(user) {
				$("#errormessage").append("sigup successfull");
			},
			error: function(user, error) {
				clearMessage();
				displayError(error.message);
			}
		});
	}
});

var BookListView = Parse.View.extend({

	el: "#content",
	
	events: {
		"click #logout": "logout"
	},

	initialize: function() {
		window.location.hash = "#list";
		this.render();
	},

	render: function(){
		var html = tpl.get('booklist'); // $('#bookListTemplate').html();
		//var html = Mustache.to_html(tmpl);
		this.$el.empty();
		this.$el.append(html);
	},

	logout: function() {
		Parse.User.logOut();
		new LoginView();

		//TODO: Fix this, needed to reload kickstart.js - no causes the window to flicker
		//window.location.reload(true);
	}
});

/*
var AppView = Parse.View.extend({

	el: $("#main"),

	initialize: function() {
		this.render();
	},

	render: function() {
		if(Parse.User.current())
			new BookListView();
		else
		{	
			if(!window.location.toString().endsWith("tabr1"))
				window.location = window.location + "?#tabr1";
			new LoginView();
		}

	}
});
*/
String.prototype.endsWith = function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};

var AppRouter = Parse.Router.extend({
	routes: {
		"": 			"index",
		"login": 		"login", 
		"signup": 		"login",
		"list":  		"list", 
		"book": 		"book",
		"suggest": 		"suggest",
	},

	index: function() {
		if(Parse.User.current()) {
			new BookListView();
		}
		else {
			this.login();
		}
	},

	login: function() {
		new LoginView();
	},

	list: function() {
		if(Parse.User.current()) 
			new BookListView();
		else
			this.login();
	},
});

$(document).ready(function() {

	tpl.loadTemplates(['booklist', 'login'], function () {
	    new AppRouter();
		//new AppView();
		Parse.history.start();
	});
});


tpl = {
 
    // Hash of preloaded templates for the app
    templates:{},
 
    // Recursively pre-load all the templates for the app.
    // This implementation should be changed in a production environment. All the template files should be
    // concatenated in a single file.
    loadTemplates:function (names, callback) {
 
        var that = this;
 
        var loadTemplate = function (index) {
            var name = names[index];
            console.log('Loading template: ' + name);

            $.get('templates/' + name + '.html', function (data) {
                that.templates[name] = data;
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
        }
 
        loadTemplate(0);
    },
 
    // Get template by name from hash of preloaded templates
    get:function (name) {
        return this.templates[name];
    }
 
};

//TODO: more generic handling of error messages
function clearMessage() {
	$("#message").empty();
}

function displayMessage(message) {
	clearError();
	clearMessage();
	$("#message").append(message);
}

function clearError() {
	$("#errormessage").empty();
}

function displayError(message) {
	clearError();
	$("#errormessage").append(message);
}