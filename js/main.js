Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var LoginView = Parse.View.extend({

	el: "#content",

	events: {
		"click #login_button": 		"login",
		"click #signup_button": 	"signup",
		//"change input": 	 		"validate"
	},

	initialize: function() {
		window.location.hash = "#login";
		this.render();
	},

	render: function() {
		clearError();

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

	validate: function() {

		var user = this.user();

		if(user.name.length == 0)
			this.$el.find("#username").addClass('error');
		else
			this.$el.find("#username").removeClass('error');

		if(user.password.length == 0)
			this.$el.find("#password").addClass('error');
		else
			this.$el.find("#password").removeClass('error');

		return user.name.length > 0 && user.password.length > 0;
	},

	login: function() {
		clearError();

		var user = this.user();

		//if(!this.validate())
		//	return;
		
		Parse.User.logIn(user.name, user.password, {
			success: function(user) {
				new BookListView();
			},	
			error: function(user, error) {
				displayError(error.message);
				/*new NotificationView({
					type: 'error',
					icon: 'remove',
					text: error.message
				});*/
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

var BookView = Parse.View.extend({

	tagName: "li",

	events: {
		"click #removeBook"   : "clear",
	},

	initialize: function() {
		_.bindAll(this, 'render', 'remove' );
		this.model.bind('change', this.render);
		this.model.bind('destroy', this.remove);
	},

	render: function(book) {
		var html = tpl.get('book'); // $('#bookListTemplate').html();
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
		return this;
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
		clearError();
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

/*<!-- Error -->
<div class="notice error"><i class="icon-remove-sign icon-large"></i> This is an Error Notice 
<a href="#close" class="icon-remove"></a></div>

<!-- Warning -->
<div class="notice warning"><i class="icon-warning-sign icon-large"></i> This is a Warning Notice 
<a href="#close" class="icon-remove"></a></div>

<!-- Success -->
<div class="notice success"><i class="icon-ok icon-large"></i> This is a Success Notice 
<a href="#close" class="icon-remove"></a></div>*/
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
		var html = tpl.get('password'); // $('#bookListTemplate').html();
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
    	data["percentage"] =  this.percentage(); 
    	data["nextMilestone"] = nextMileStone;
    	data["pagesToNextMilestone"] = this.pagesToNextMilestone();
    	data["percentageLeft"] = this.percentageLeft();
    	data["pagesToMilestone"] = this.pagesToMilestone(nextMileStone);
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

	password: function() {
		
		new PasswordView();
	},

	list: function() {
		
		if(Parse.User.current()) 
			new BookListView();
		else
			this.login();
	},

	edit: function(id) {
		
		new EditView({
			objectId: id,
		});
	}
});

$(document).ready(function() {

	tpl.loadTemplates(['login', 'list', 'book', 'password', 'notification'], function () {
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
    this.unbind();
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

var notice;

function clearError() {

	new EmptyView();

}

function displayError(message) {
	
	new NotificationView({
					type: 'error',
					icon: 'remove',
					text: message
				});
}