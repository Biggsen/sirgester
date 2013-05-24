Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var LoginView = Parse.View.extend({

	el: "#loginForm",

	events: {
		"click #login": 	"login",
		"click #signup": 	"signup",
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
				clearMessage();
				$("#errormessage").append("sigup successfull");
			},
			error: function(user, error) {
				clearMessage();
				displayError(error.message);
			}
		});
	}
});

$(document).ready(function() {
	var view = new LoginView();
});

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
