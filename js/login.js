Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var LoginView = Parse.View.extend({

	el: "#loginForm",

	events: {
		"click #login": 	"login",
		"click #signup": 	"signup",
	},

	login: function() {
		var username = this.$el.find("#username").val();
		var password = this.$el.find("#password").val();
		
		Parse.User.logIn(username, password, {
			success: function(user) {
				//window.location = "list.html";
				alert('login successfull');
			},
			error: function(user, error) {
				//$(".error").removeClass('is-hidden');
				alert('login unsuccessfull');
			}
		});
	},

	signup: function() {
		var username = this.$el.find("#su_username").val();
		var password = this.$el.find("#su_password").val();
		var email = this.$el.find("#su_email").val();

		var user = new Parse.User();
		user.set("username", username);
		user.set("password", password);
		user.set("email", email);
		
		user.signUp(null, {
			success: function(user) {
				//$(".success").removeClass('is-hidden');
				alert('signup successfull');
			},
			error: function(user, error) {
				//$(".error").removeClass('is-hidden');
				alert('sigup unsuccessfull');
			}
		});
	}
});

$(document).ready(function() {
	var view = new LoginView();
});