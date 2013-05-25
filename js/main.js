Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var LoginView = Parse.View.extend({

	el: "#content",

	events: {
		"click #login_button": 				"login",
		"click #signup_button": 			"signup",
		"change input#username":			"validateLogin",
		"change input#password":			"validateLogin",
		"change input#su_username":			"validateSignUp",
		"change input#su_email":			"validateSignUp",
		"change input#su_password":			"validateSignUp",
		"change input#su_confirmpassword":	"validateSignUp",
	},

	initialize: function() {
		window.location.hash = "#login";
		_.bindAll(this, 'validate' );
		this.render();
	},

	render: function() {
		clearNotification();

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

	user: function() {
		return {
			name : this.$el.find("#username").val(),
			password: this.$el.find("#password").val(),  
		}
	},

	validate: function(elements) {
		var result = true;
		_.each(elements, function( element ){
			var el = this.$(element)
			if(el.val().length == 0) {
				el.addClass('error');
				result = false;
			} else {
				el.removeClass('error');
			}
		});
		return result;
	},

	validateLogin: function() {
		return this.validate(['#username', '#password']);
	},

	validateSignUp: function() {
		return this.validate(['#su_username', '#su_password', '#su_confirmpassword', '#su_email']);
	},

	login: function() {
		clearNotification();

		var user = this.user();

		if(!this.validateLogin()) {	
			displayError("No empty boxes allowed");
			return;
		}
		
		Parse.User.logIn(user.name, user.password, {
			success: function(user) {
				new BookListView();
			},	
			error: function(user, error) {
				displayError(error.message);
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
				new NotificationView({
					type: 'success',
					icon: 'ok ',
					text: "You have been signed up for the gester"
				});
			},
			error: function(user, error) {
				new NotificationView({
					type: 'error',
					icon: 'remove',
					text: error.message
				});
			}
		});
	}
});

var Genre = Parse.Object.extend("Genre", {
	defaults: {
		name: '',
	}
});

var Genres = Parse.Collection.extend({
	model: Genre,
});

var GenreOptionView = Parse.View.extend({

	tagName: "option",

	initialize: function() {
		var html = tpl.get('genre-option'); 
		this.$el.attr('value', this.model.id);
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
	},

});

var GenreListView = Parse.View.extend({
	
	el: "#genre",

	initialize: function() {

		_.bindAll(this, 'addOne', 'addAll' );
		this.genres = new Genres();
		//this.genres.bind('all',     this.render);
		this.genres.bind('reset',   this.addAll);
		this.genres.fetch();

		var html = tpl.get('genre-list'); 
		this.$el.html(html);
	},

	// Add a single book item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(genre) {
      var view = new GenreOptionView({model: genre});
      this.$("#list-genre").append(view.render().el);
    },

    // Add all items in the Book collection at once.
    addAll: function(collection, filter) {
      this.$el.find("#list-genre").html("");
      this.genres.each(this.addOne);
      this.$el.find("#list-genre option:contains('" + this.model.get("genre") + "')").attr('selected', 'selected');
    },
});

var BookEditView = Parse.View.extend({

	el: $("#content"),

	events: {
		"click #details":  	"details",
		"click #save":  	"save", 
	},

	initialize: function() {

		_.bindAll(this, 'save', 'details');

		var html = tpl.get('add'); 
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
		
		
		this.genresView = new GenreListView({
			model: this.model
		});
	},	

	save: function() {
		if(this.model.isNew()) {
			alert('is new');
		} else {
			this.model.save({
				name: this.$el.find("#bookname").val(),
				author: this.$el.find("#author").val(),
				genre: this.$el.find("#list-genre option:selected").text(),  //TODO use val to get Id
				totalpages: this.$el.find("#totalpages").val(),
				currentPage: this.$el.find("#currpage").val()
			},{
				success: function( instance ) {
					displaySuccess("Book was saved");
				},
				error: function(object, error) {
					displayMessage(error.message);
				}
			});
		}
	},

	details: function() {
		window.location.hash = "#details/" + this.model.id;
	},
});

var BookDetailsView = Parse.View.extend({

	el: $("#content"),

	events: {
		"click #edit":  	"edit",
		"click #save":  	"save", 
		"submit":  			"save", 
	},

	initialize: function() {
		
		_.bindAll(this, 'render', 'save');

		this.model.bind('change', this.render);
		this.render();
	},	

	render: function() {
		var html = tpl.get('book-detail'); 
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
	},

	save: function() {
		this.model.save({
				currentPage: this.$el.find("#currpage").val()
			},{
				success: function( instance ) {
					displaySuccess("Book was saved");
				},
				error: function(object, error) {
					displayMessage(error.message);
				}
			});
	},

	edit: function() {
		window.location.hash = "#edit/" + this.model.id;
	}
});

var BookView = Parse.View.extend({

	tagName: "li",

	events: {
		"click #book"   	: "details",
		"click #removeBook"	: "clear",
	},

	initialize: function() {
		_.bindAll(this, 'render', 'remove' );
		this.model.bind('change', this.render);
		this.model.bind('destroy', this.remove);
	},

	render: function() {
		if(parseFloat(this.model.get("currentPage")) < parseFloat(this.model.get("totalpages"))) {
			var html = tpl.get('book'); 
			this.$el.html(Mustache.to_html(html, this.model.toJSON()));
		} else {
			this.$el.html('');
		}
		return this;
	},

	details: function() {
		window.location.hash = "#details/" + this.model.id;
		/*new BookEditView({
			model: this.model
		});*/
		//this.undelegateEvents();
		//delete this;
	},

	// Remove the item, destroy the model.
    clear: function() {
    	if(confirm("Are you sure you want to delete?"))
    		alert('book deleted');
      		//this.model.destroy();
    }
});

var BookListView = Parse.View.extend({

	el: "#content",
	
	events: {
		"click #logout": "logout"
	},

	initialize: function() {
		clearNotification();
		window.location.hash = "#list";

		_.bindAll(this, 'render', 'addOne', 'addAll' );

		this.books = new Books();
		this.books.query = new Parse.Query(Book);
		//TODO: fix, so we can skip get("username")
		this.books.query.equalTo("shelfed", false);
		this.books.query.equalTo("username", Parse.User.current().get("username"));
		this.books.query.ascending("name"); 

		this.books.comparator = function (book) {
			return book.percentageLeft();
		}

		this.books.bind('add',     this.addOne);
     	this.books.bind('reset',   this.addAll);
		this.books.bind('all',     this.render);
		this.books.fetch();

		var html = tpl.get('list'); // $('#bookListTemplate').html();
		this.$el.html(html);
	},

	render: function(){
		return this;
	},

	// Add a single book item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(book) {
      var view = new BookView({model: book});
      this.$("#books").append(view.render().el);
    },

    // Add all items in the Book collection at once.
    addAll: function(collection, filter) {
      this.$el.find("#books").html("");
      this.books.each(this.addOne);
    },

	logout: function() {
		Parse.User.logOut();
		new LoginView();

		//TODO: Fix this, needed to reload kickstart.js - no causes the window to flicker
		//window.location.reload(true);
	}
});


var NotificationView = Parse.View.extend({

	el: "#notifications",

	initialize: function() {
		var html = tpl.get('notification');
		this.$el.html(Mustache.to_html(html, this.options));
	}

});

var EmptyView = Parse.View.extend({

	el: "#notifications",

	initialize: function() {
		this.$el.html('');
	}

});

var PasswordView = Parse.View.extend({

	el: "#content",

	initialize: function() {
		var html = tpl.get('password'); 
		this.$el.html(html);
	},
});

var EditView = Parse.View.extend({

	el: "#content",

	initialize: function() {
		alert(this.options.objectId);
		this.render();
		return this;
	},

	render: function() {
		var html = tpl.get('add'); // $('#bookListTemplate').html();
		this.$el.html(html);
	}
});


var Book = Parse.Object.extend("Book", {

	initialize: function() {
		_.bindAll(this, 'toJSON' );	
	},

	defaults : {
		"id": null,
		"name": "",
		"genre" : "",
		"author": "",
		"totalpages": 1,
		"currentPage": 1,
		"shelfed": false
	},

	
	//calculated fields
  	percentage: function() {
  		return ((parseFloat(this.get("currentPage")) / parseFloat(this.get("totalpages"))) * 100).toFixed(2);
  	},

	nextMilestone: function () {
		var milestones = [25,50,75,100];
		for (var i = 0, len = milestones.length; i < len; i++) {
			var result = this.pagesToMilestone( milestones[i] );
			if( result > 0 )
				return milestones[i];
		}
		return 0;
	},

	pagesToMilestone: function ( milestone ) {
	    var result  = this.mileStonePage( milestone ) - this.get("currentPage");
		if( result < 0 )
			return 0;
		return result;
	},

	mileStonePage: function ( milestone ) {
		return (( milestone * this.get("totalpages") ) / 100).toFixed(0);
	},

	pagesToNextMilestone: function ( ) {
	    var result  = this.mileStonePage( this.nextMilestone() ) - this.get("currentPage");
		if( result < 0 )
			return 0;
		return result;
	},

	percentageLeft: function() {
		var milestone = this.nextMilestone();
		var perc = this.percentage();
		return (milestone - perc).toFixed(2);
	},

  	//http://kilon.org/blog/2012/02/backbone-calculated-fields/
  	toJSON: function() {
    	var data = {};
    	var json = Parse.Object.prototype.toJSON.call(this);
    	_.each(json, function(value, key) {
      		data[key] = this.get(key);
    	}, this);
    	data["objectId"] =  this.id;
    	data["createdAt"] =  this.createdAt;
    	data["updatedAt"] =  this.updatedAt; 
    	var nextMileStone = this.nextMilestone();
    	data["percentage"] =  parseFloat(this.percentage()).toFixed(0); 
    	data["nextMilestone"] = nextMileStone;
    	data["pagesToNextMilestone"] = this.pagesToNextMilestone();
    	data["percentageLeft"] = parseFloat(this.percentageLeft()).toFixed(0);
    	data["pagesToMilestone"] = this.mileStonePage(nextMileStone);
    	return data;
  	},
  	/*get: function(attr) {
    	var value = Parse.Object.prototype.get.call(this, attr);
    	return _.isFunction(value) ? value.call(this) : value;
  	},*/
});

var Books = Parse.Collection.extend({
	model: Book
});

String.prototype.endsWith = function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};

var AppRouter = Parse.Router.extend({
	routes: {
		"": 			"index",
		"login": 		"login", 
		"signup": 		"login",
		"newpassword":	"password",
		"list":  		"list", 
		"edit/:id": 	"edit", 
		"details/:id": 	"details", 
		"book": 		"book",
		"suggest": 		"suggest",
	},

	index: function() {
		
		if(Parse.User.current()) {
			if(this.currentView) this.currentView.close();

	    	this.currentView = new BookListView({
	    		el: "#content",
			});
		}
		else {
			this.login();
		}
	},

	login: function() {
		if(this.currentView) this.currentView.close();

    	this.currentView = new LoginView({
    		el: "#content",
		});
	},

	password: function() {
		if(this.currentView) this.currentView.close();

    	this.currentView = new PasswordView({
    		el: "#content",
		});
	},

	list: function() {
		if(Parse.User.current()) {
			if(this.currentView) this.currentView.close();

	    	this.currentView = new BookListView({
	    		el: "#content",
			});
		}
		else {
			this.login();
		}
	},

	edit: function(id) {
		if(Parse.User.current()) {
			var query = new Parse.Query(Book);
			query.get(id, {
			 	success: function(book) {
			 		if(this.currentView) this.currentView.close();

			    	this.currentView = new BookEditView({
			    		el: "#content",
			    		model: book
					});
				},
				error: function(object, error) {
					displayMessage(error.message);
				}
			});
		} else {	
			this.login();
		}
	},

	details: function(id) {
		if(Parse.User.current()) {
			var query = new Parse.Query(Book);
			query.get(id, {
			 	success: function(book) {
			 		if(this.currentView) this.currentView.close();

			    	this.currentView = new BookDetailsView({
			    		el: "#content",
			    		model: book
					});
				},
				error: function(object, error) {
					displayMessage(error.message);
				}
			});
		} else {	
			this.login();
		}
	}
});

$(document).ready(function() {

	tpl.loadTemplates(['login', 'list', 'book', 'password', 'notification', 'book-detail', 'add', 'genre-list', 'genre-option'], function () {
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


Parse.View.prototype.close = function () {
    console.log('Closing view ' + this);
    if (this.beforeClose) {
        this.beforeClose();
    }
    //this.remove();
    this.undelegateEvents();
    this.unbind();
};

//TODO: more generic handling of error messages
function clearMessage() {
	$("#message").empty();
}

function displayMessage(message) {
	clearNotification();
	clearMessage();
	$("#message").append(message);
}

var notice;

function clearNotification() {

	new EmptyView();

}

/*<!-- Error -->
<div class="notice error"><i class="icon-remove-sign icon-large"></i> This is an Error Notice 
<a href="#close" class="icon-remove"></a></div>

<!-- Warning -->
<div class="notice warning"><i class="icon-warning-sign icon-large"></i> This is a Warning Notice 
<a href="#close" class="icon-remove"></a></div>

<!-- Success -->
<div class="notice success"><i class="icon-ok icon-large"></i> This is a Success Notice 
<a href="#close" class="icon-remove"></a></div>*/
function displaySuccess(message) {
	
	new NotificationView({
					type: 'success',
					icon: 'ok',
					text: message
				});
}

function displayError(message) {
	
	new NotificationView({
					type: 'error',
					icon: 'remove',
					text: message
				});
}

