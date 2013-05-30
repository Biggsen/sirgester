/* Init parse */

Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

/* Genre Views */

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
					Notify.success("Genre was saved");
				},
				error: function(object, error) {
					Notify.error(error.message);
				}
			});
		
		return false;
	},

	delete: function() {
		if(confirm("Are you sure you want to delete?")) {
    		this.model.destroy();
    		this.model = new Genre();
    		Notify.success("Genre was deleted");
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
	
	//el: "#genre",
	tagName: "div",

	events: {
		"click #editGenre": 	"edit",
		"click #newGenre": 		"newgenre",
		"click #showinput":		"show",
		"click #hideinput":		"hide",
		"click #addgenre":		"add",
	},

	initialize: function() {

		_.bindAll(this, 'render', 'addOne', 'addAll', 'show', 'add' );
		this.genres = new Genres();
		//this.genres.bind('all',     this.render);

		//this.model.bind('change', this.render);
		this.genres.query = new Parse.Query(Genre);
		//this.genres.query.ascending("name");
		this.genres.bind('add',     this.addOne);
		this.genres.bind('reset',   this.addAll);
		this.genres.fetch();

		this.genres.comparator = function (genre) {
			return genre.get("name").toLowerCase();
		}

		var html = tpl.get('genre-list');
		this.$el.append(html);
	},

	render: function() {
		return this;
	},

	add: function () {

		if(!validate(['#newgenre'])) {
			Notify.error("Genre may not be empty");
			return false;
		}

		var genreObj = new Genre();
		var self = this;
		genreObj.save({
			name: this.$el.find("#newgenre").val()
		}, {
			success: function( genre ) {
				self.genres.add(genre);
				self.genres.sort();
				Notify.success("Genre was saved");
				self.hide();
			},
			error: function( genre, error ) {
				Notify.error(error.message);
			}
		});
		return false;
	},

	show: function() {
		this.$el.find("#inputgenre").removeClass("hide");
		return false;
	},

	hide: function() {
		this.$el.find("#inputgenre").addClass("hide");
		return false;
	},
/*
	delete: function() {
		this.$el.html('');
		return false;
	},
*/
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

/* Author Views */

var AuthorView = Parse.View.extend({

	//el: "#author",
	tagName: 'div',

	events: {
		"click #addauthor": "add", 
		"click #removeauthor": "removeauthor", 
	},

	initialize: function() {

		_.bindAll(this, 'add')

		var html = tpl.get('author'); 

		this.parent = this.options.parent

		//var sign = (this.parent) ? 'plus' : 'minus';
		//var action = (this.parent) ? 'add' : 'remove';

		var render = {
			author: this.model.get("author"),
			sign: this.options.sign,
			action: this.options.action
		};

		this.$el.html(Mustache.to_html(html, render));
		
	},

	render: function() {
		return this;
	},

	add: function() {
		if(this.options.parent)
			this.options.parent.addauthor();
		return false;
	},

	removeauthor: function() {
		if(this.options.parent)
			this.options.parent.removeauthor(this);
		return false;
	}
});

/* Book Views */

var BookAddView = Parse.View.extend({

	el: $("#content"),

	events: {
		"click #savebook":  				"savebook", 
		"change input#bookname":			"validateBook",
		"change input#author":				"validateBook",
		"change input#totalpages":			"validateBook",
		"change input#currpage":			"validateBook",
	},

	initialize: function() {

		_.bindAll(this, 'savebook', 'validateBook', 'addauthor', 'removeauthor' );

		var html = tpl.get('add'); 
		this.$el.html(Mustache.to_html(html, this.model.toJSON()));
		
		this.authorViewList = [];

		var view = new AuthorView({
			model: this.model,
			parent: this,
			sign: 'plus',
			action: 'add'
		});
		this.authorViewList.push(view);
		this.$el.find("#author").append(view.render().el);

		if(this.genresView) this.genresView.close();

		this.genresView = new GenreListView({
			model: this.model,
		});
		this.$el.find("#genre").append(this.genresView.render().el);

		this.model.set("username", Parse.User.current().get("username"));
	},

	addauthor: function() {
		var view = new AuthorView({
			model: this.model,
			parent: this,
			sign: 'minus',
			action: 'remove'
		});
		this.authorViewList.push(view);
		this.$el.find("#author").append(view.render().el);
		return false;		
	},

	removeauthor: function(view) {
		var idx = this.authorViewList.indexOf(view);

		//Doesn't work on IE8 and earlier
		this.authorViewList.splice(idx, 1);

		// hide view
		view.remove();
		view.unbind();
		return false;
	},

	validateBook: function() {
		if(this.submit)
			return validate(['#bookname', '#author', '#totalpages', '#currpage']);
	},

	savebook: function() {
		
		this.submit = true;

		if(!this.validateBook()) {	
			//Notify.success("No empty boxes allowed");
			Notify.error("No empty boxes allowed");
			return false;
		}

		if(parseFloat(this.$("#currpage").val()) >= parseFloat(this.$("#totalpages").val())) {
			Notify.warn("Have you read this book already?");
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
				Notify.success("Book was saved");
			},
			error: function(object, error) {
				Notify.error(error.message);
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
			this.$el.find("#shelf i").removeClass('icon-pause').addClass('icon-play');
		}
		return this;
	},

	save: function() {
		this.model.save({
				currentPage: this.$el.find("#currpage").val()
			},{
				success: function( instance ) {
					Notify.success("Book was saved");
				},
				error: function(object, error) {
					Notify.error(error.message);
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
						Notify.success("Book was shelfed");
					else
						Notify.success("Book was unshelfed");
				},
				error: function(object, error) {
					Notify.error(error.message);
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
    		Notify.success("Book was deleted");
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
		Notify.clear();

		_.bindAll(this, 'render', 'addOne', 'addAll' );

		this.books = new Books();
		this.books.query = new Parse.Query(Book);
		//TODO: fix, so we can skip get("username")
		//this.books.query.equalTo("shelfed", false);
		this.books.query.equalTo("username", Parse.User.current().get("username"));
		this.books.query.ascending("name"); 
		//this.books.query.ascending("shelfed"); 

		this.books.comparator = function (book) {
			return parseFloat(book.percentageLeft());
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
	}
});

/* Login Views */

var PasswordView = Parse.View.extend({

	el: "#content",

	initialize: function() {
		var html = tpl.get('password'); 
		this.$el.html(html);
	},
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
		this.render();
	},

	render: function() {
		Notify.clear();

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
		if(this.triedLogin)
			return validate(['#username', '#password']);
	},

	validateSignUp: function() {
		if(this.triedSumbit)
			return validate(['#su_username', '#su_password', '#su_confirmpassword', '#su_email']);
	},

	login: function() {

		this.triedLogin = true

		Notify.clear();

		var user = this.user();

		if(!this.validateLogin()) {	
			Notify.error("No empty boxes allowed");
			return;
		}
		
		Parse.User.logIn(user.name, user.password, {
			success: function(user) {
				window.location.hash = "#list";
			},	
			error: function(user, error) {
				Notify.error(error.message);
			}
		});
		return false;
	},

	signup: function() {

		this.triedSumbit = true

		var username = this.$el.find("#su_username").val();
		var password = this.$el.find("#su_password").val();
		var email = this.$el.find("#su_email").val();

		var user = new Parse.User();
		user.set("username", username);
		user.set("password", password);
		user.set("email", email);
		
		user.signUp(null, {
			success: function(user) {
				Notify.success("You have been signed up for sir gester");
			},
			error: function(user, error) {
				Notify.error(error.message);
			}
		});
		return false
	}
});

/* Notifications */

var Notify = {

	success: function(message) {
		if(this.notify) this.notify.close();
		
		this.notify = new NotificationView({
					type: 'success',
					icon: 'ok',
					text: message
				});	
	},

	warn: function(message) {
		if(this.notify) this.notify.close();

		this.notify = new NotificationView({
					type: 'warning',
					icon: 'warning',
					text: message
				});	
	},

	error: function(message) {
		
		if(this.notify) this.notify.close();

		this.notify = new NotificationView({
					type: 'error',
					icon: 'remove',
					text: message
				});
	},

	clear: function() {
		if(this.notify) this.notify.close();

		this.notify = new EmptyView();
	}
}

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

/* App routing */

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

	login: function() {
		return this.showView(null, LoginView);
	},

	password: function() {
		return this.showView(null, PasswordView);
	},

	index: function() {
		if(!Parse.User.current()) this.login();
		return this.showView(null, BookListView);
	},

	list: function() {
		if(!Parse.User.current()) this.login();
		return this.showView(null, BookListView);
	},

	add: function() {
		if(!Parse.User.current()) this.login();
		return this.showView(new Book(), BookAddView);
	},

	edit: function(id) {
		if(!Parse.User.current()) this.login();
		return this.showViewQuery(id, Book, BookAddView);
	},

	details: function(id) {
		if(!Parse.User.current()) this.login();
		return this.showViewQuery(id, Book, BookDetailsView);
	},

	showViewQuery: function(id, Constructor, View) {
		var self = this;
		var query = new Parse.Query(Constructor);
		query.get(id, {
		 	success: function(book) {
		 		self.showView(book, View);
			},
			error: function(object, error) {
				Notify.error(error.message);
			}
		});
	},

	showView: function(model, View) {
		if(this.currentView) this.currentView.close();

    	this.currentView = new View({
    		el: "#content",
    		model: (model) ? model : null
		});
		return false;
	},

	/*TODO need to fix this */
	genre: function(id) {
		if(!Parse.User.current()) this.login();
		if(!id) {
			this.showView(new Genre(), GenreEditView)
		} else {
			var self = this;
			var query = new Parse.Query(Genre);
			query.equalTo("name", id)
			query.find({
			 	success: function(genre) {
			 		self.showView(genre[0], GenreEditView)
				},
				error: function(object, error) {
					Notify.error(error.message);
				}
			});
		}
	}
});

/* main */

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
			'author',
			'genre-list', 
			'genre-option', 
			'genre-edit'], 
		function () {
		    new AppRouter();
			//new AppView();
			Parse.history.start();
		});
});
