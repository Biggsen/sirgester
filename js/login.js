Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var LoginView = Parse.View.extend({

	el: "#content",

	events: {
		"click #login": 	"login",
		"click #signup": 	"signup",
	},

	initialize: function() {
		this.render();
	},

	render: function() {
		var html = tpl.get('login');//  $('#loginTemplate').html();
		//var html = Mustache.to_html(tmpl);
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

var AppView = Parse.View.extend({

	el: $("#main"),

	initialize: function() {
		this.render();
	},

	render: function() {
		if(Parse.User.current())
			//alert('logged in');
			new BookListView();
		else
			new LoginView();

	}
});

var AppRouter = Parse.Router.extend({
	routes: {
		"book": 		"book",
		"suggest": 	"	suggest",
	},

	book: function() {
		alert('book router');
	},

	suggest: function() {
		alert('suggest router');
	},
});

$(document).ready(function() {

	tpl.loadTemplates(['booklist', 'login'], function () {
	    new AppRouter();
		new AppView();
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

function clearMessage() {
	$("#message").empty();
}

function displayMessage(message) {
	clearError();
	$("#message").append(message);
}

function clearError() {
	$("#errormessage").empty();
}

function displayError(message) {
	clearError();
	$("#errormessage").append(message);
}