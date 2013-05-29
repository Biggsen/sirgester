Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var GenreEditView = Parse.View.extend({

	el: "#content",

	events: {
		"click #savegenre": 	"save",
		"click #deletegenre": 	"delete", 
	},

	initialize: function() {
		_.bindAll(this, 'save', 'delete');
		var html = tpl.get('genre-edit');
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
	},

	save: function() {
		this.model.save({
				name: this.$el.find("#name").val()
			},{
				success: function( instance ) {
					displaySuccess("Genre was saved");
				},
				error: function(object, error) {
					displayMessage(error.message);
				}
			});
		
		return false;
	},

	delete: function() {
		if(confirm("Are you sure you want to delete?")) {
    		this.model.destroy();
    		this.model = new Genre();
    		displaySuccess("Genre was deleted");
    		this.render();
      	}
		return false;
	}

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
	//tagName: "div",

	events: {
		"click #editGenre": 	"edit",
		"click #newGenre": 		"newgenre",
		"click #addgenre":		"addgenre",
	},

	initialize: function() {

		_.bindAll(this, 'render', 'addOne', 'addAll' );
		this.genres = new Genres();
		//this.genres.bind('all',     this.render);
		this.genres.bind('reset',   this.addAll);
		this.genres.fetch();

		this.$el.html(tpl.get('genre-list'));
	},

	render: function() {
		
		return this;
	},

	addgenre: function() {
		/*if(this.genresView2) this.genresView2.close();

		this.genresView2 = new GenreListView({
			model: this.model
		});*/

		this.$el.append(tpl.get('genre-list'));
		//alert('add g');
//		this.$el.append(this.render().el);
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

    newgenre: function() {
    	window.location.hash = "#genre";
    	return false;
    },

    edit: function() {
    	window.location.hash = "#genre/" + this.$el.find("#list-genre option:selected").text();  //TODO use val to get Id
    	return false;
    }
});

var BookAddView = Parse.View.extend({

	el: $("#content"),

	events: {
		"click #savebook":  				"savebook", 
		//"submit":  							"savebook", 
		"change input#bookname":			"validateBook",
		"change input#author":				"validateBook",
		"change input#totalpages":			"validateBook",
		"change input#currpage":			"validateBook",
	},

	initialize: function() {

		_.bindAll(this, 'savebook' );

		var html = tpl.get('add'); 
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
		
		if(this.genresView) this.genresView.close();

		this.genresView = new GenreListView({
			model: this.model
		});

		//this.$el.find("#genre").append(this.genresView.render().el);
	},

	validateBook: function() {
		return validate(['#bookname', '#author', '#totalpages', '#currpage']);
	},

	savebook: function() {
		
		if(!this.validateBook()) {	
			displayError("No empty boxes allowed");
			return false;
		}

		if(parseFloat(this.$("#currpage").val()) >= parseFloat(this.$("#totalpages").val())) {
			displayWarning("Have you read this book already?");
			return false;
		}	

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
		return false;
	}
});


var BookEditView = Parse.View.extend({

	el: $("#content"),

	events: {
		"click #savebook":  				"savebook", 
		//"submit":  							"savebook", 
		"change input#bookname":			"validateBook",
		"change input#author":				"validateBook",
		"change input#totalpages":			"validateBook",
		"change input#currpage":			"validateBook",
	},

	initialize: function() {

		_.bindAll(this, 'savebook' );

		var html = tpl.get('edit'); 
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
		
		if(this.genresView) this.genresView.close();

		this.genresView = new GenreListView({
			model: this.model
		});
	},

	validateBook: function() {
		return validate(['#bookname', '#author', '#totalpages', '#currpage']);
	},

	savebook: function() {
		
		if(!this.validateBook()) {	
			displayError("No empty boxes allowed");
			return false;
		}

		if(parseFloat(this.$("#currpage").val()) >= parseFloat(this.$("#totalpages").val())) {
			displayWarning("Have you read this book already?");
			return false;
		}	

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
		return false;
	}
});

var BookDetailsView = Parse.View.extend({

	//el: "#book-details",
	tagName: "div",

	events: {
		"click #edit":  	"edit",
		"click #save":  	"save", 
		"submit":  			"save", 
		"click #delete": 	"delete", 
		"click #shelf": 	"shelf", 
	},

	initialize: function() {
		
		_.bindAll(this, 'render', 'save', 'delete', 'shelf');

		this.model.bind('change', this.render);
		this.model.bind('create', this.render);
//		this.render();
	},	

	render: function() {
		var html = tpl.get('book-detail'); 
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
		this.$el.addClass("js-book-details");
		if(this.model.get("shelfed")) {
			this.$el.find("#shelf").html("unshelf");
		}
		return this;
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
		return false;
	},

	shelf: function() {
		var shelfValue = !this.model.get("shelfed");
		this.model.save({
				shelfed: shelfValue
			},{
				success: function( instance ) {
					if(shelfValue)
						displaySuccess("Book was shelfed");
					else
						displaySuccess("Book was unshelfed");
				},
				error: function(object, error) {
					displayMessage(error.message);
				}
			});
		return false;
	},

	edit: function() {
		window.location.hash = "#edit/" + this.model.id;
		return false;
	},
	
	// Remove the item, destroy the model.
    delete: function() {
    	if(confirm("Are you sure you want to delete?")) {
    		this.model.destroy();
    		this.model = new Book();
    		displaySuccess("Book was deleted");
    		this.render();
      	}
      	return false;
    }
});

var BookView = Parse.View.extend({

	tagName: "li",

	events: {
		"click #book"   	: "details",
	},

	initialize: function() {
		_.bindAll(this, 'render', 'remove', 'details' );
		//this.model.bind('change', this.render);
		//this.model.bind('destroy', this.remove);
	},

	render: function() {

		var html = tpl.get('book'); 	
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));

		if(this.model.get("shelfed")) {
			var del = this.$el.find("#shelfed").html();
			this.$el.find("#shelfed").html("<del>" + del + "</del>");
		}

		var detailView = new BookDetailsView( {model: this.model });
		var eldetail = detailView.render().el;
		$(eldetail).addClass('hide');
		$(eldetail).attr('id', 'show_' + this.model.id);
		this.$el.find('#book-details').append(eldetail);


		return this;
	},

	details: function() {

		//prepare
		$('#books li').removeClass('is-active');

		var elm = $('#show_' + this.model.id);
		if(elm.hasClass('hide')){
			$(".js-book-details").addClass('hide');
			
			elm.removeClass('hide');
			this.$el.addClass('is-active');
		} else {
			elm.addClass('hide');
		}
		//window.location.hash = "#details/" + this.model.id;
		return false;
	},
});

var BookListView = Parse.View.extend({

	el: "#content",
	
	events: {
		"click #logout": 	"logout",
		"click #add":   	"addnewbook"	
	},

	initialize: function() {
		clearNotification();

		_.bindAll(this, 'render', 'addOne', 'addAll' );

		this.books = new Books();
		this.books.query = new Parse.Query(Book);
		//TODO: fix, so we can skip get("username")
		//this.books.query.equalTo("shelfed", false);
		this.books.query.equalTo("username", Parse.User.current().get("username"));
		this.books.query.ascending("name"); 
		//this.books.query.ascending("shelfed"); 

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
      	if(parseFloat(book.get("currentPage")) < parseFloat(book.get("totalpages"))) { 
      		var view = new BookView({model: book});
      		this.$("#books").append(view.render().el);
  		}
    },

    // Add all items in the Book collection at once.
    addAll: function(collection, filter) {
      this.$el.find("#books").html("");
      //this.books.each(this.addOne);
      this.books.each(function (book) { 
      	if(!book.get("shelfed"))
      		this.addOne(book);
      	}, this);

     	this.books.each(function (book) { 
      	if(book.get("shelfed"))
      		this.addOne(book);
      	}, this);
    },

    addnewbook: function() {
		window.location.hash = "#add";
		return false;
    },

	logout: function() {
		Parse.User.logOut();
		window.location.hash = "#login";
		return false;

		//TODO: Fix this, needed to reload kickstart.js - no causes the window to flicker
		//window.location.reload(true);
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
		var html = tpl.get('add'); 	
		this.$el.html(html);
	}
});

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

	validateLogin: function() {
		return validate(['#username', '#password']);
	},

	validateSignUp: function() {
		return validate(['#su_username', '#su_password', '#su_confirmpassword', '#su_email']);
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
				window.location.hash = "#list";
			},	
			error: function(user, error) {
				displayError(error.message);
			}
		});
		return false;
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
		return false
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

Parse.View.prototype.close = function () {
    console.log('Closing view ' + this);
    if (this.beforeClose) {
        this.beforeClose();
    }
    //this.remove();
    this.undelegateEvents();
    this.unbind();
    delete this;
};


var AppRouter = Parse.Router.extend({
	routes: {
		"": 			"index",
		"login": 		"login", 
		"signup": 		"login",
		"newpassword":	"password",
		"list":  		"list", 
		"add": 			"add", 
		"edit/:id": 	"edit", 
		"details/:id": 	"details",
		"genre":  		"genre",  
		"genre/:id": 	"genre", 
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

	add: function() {
		if(Parse.User.current()) {
			if(this.currentView) this.currentView.close();

	    	this.currentView = new BookAddView({
	    		el: "#content",
	    		model: new Book({
	    			username: Parse.User.current().get("username")
	    		})
			});
		} else {	
			this.login();
		}
		return false;
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
	},

	genre: function(id) {
		if(Parse.User.current()) {
			if(!id)
			{
				if(this.currentView) this.currentView.close();

		    	this.currentView = new GenreEditView({
		    		el: "#content",
		    		model: new Genre()
				});
			} else {
				var query = new Parse.Query(Genre);
				query.equalTo("name", id)
				query.find({
				 	success: function(genre) {
				 		if(this.currentView) this.currentView.close();

				    	this.currentView = new GenreEditView({
				    		el: "#content",
				    		model: genre[0]
						});
					},
					error: function(object, error) {
						displayMessage(error.message);
					}
				});
			}
		} else {	
			this.login();
		}
	}
});

$(document).ready(function() {

	tpl.loadTemplates([
			'login', 
			'list', 
			'book', 
			'password', 
			'notification', 
			'book-detail', 
			'add', 
			'edit',
			'genre-list', 
			'genre-option', 
			'genre-edit'], 
		function () {
		    new AppRouter();
			//new AppView();
			Parse.history.start();
		});
});
