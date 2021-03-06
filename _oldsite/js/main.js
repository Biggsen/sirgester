/* Init parse */
var appName = 'Sir Gester';

Parse.initialize("LSmc8FIgALPmAp0QzU6mEn18KAajO5PPMBbigcER", "tZCSOtd32hTA7DLT8YTMSjIwCmE4x8ZX0ICktwpZ");

var BookHistoryItemView = Parse.View.extend({

    tagName: "tr",

    initialize: function() {
	_.bindAll(this, 'render' );
    },

    render: function() {

	var hour

	var min = this.model.updatedAt.getMinutes();
	if(min < 10)
	    min = "0"+min;

	var date = this.model.updatedAt.getFullYear() + "/" 
	    + pad((this.model.updatedAt.getMonth()+1), 2, "0") + "/"
	    + pad(this.model.updatedAt.getDate(), 2, "0") + " "
	    + pad(this.model.updatedAt.getHours(), 2, "0") + ":"
	    + pad(this.model.updatedAt.getMinutes(), 2, "0");

	var render = {
	    date: date,
	    page: this.model.get("page")
	};

	this.$el.html(Mustache.to_html(tpl.get("book-history-item"), render));
	return this;
    },

});

/* History Views */
// http://localhost:8080/sirgester/#bookhistory/Vau52XDluf
var BookHistoryView = Parse.View.extend({

    el: "#content",

    initialize: function () {

	_.bindAll(this, 'render', 'addAll', 'addOne' );
	this.bookhistory = new BookHistorys();
	this.bookhistory.query = new Parse.Query(BookHistory);
	this.bookhistory.query.equalTo("book", this.model);
	this.bookhistory.query.descending("updatedAt");
	this.bookhistory.bind('reset', this.addAll);
	this.bookhistory.fetch();

	this.render();
    },

    render: function() {
	this.$el.html(Mustache.to_html(tpl.get("book-history"), this.model.toJSON()));
	return this;
    },

    addOne: function(history) {
	var view = new BookHistoryItemView({model: history});
	this.$("#list-bookhistory").append(view.render().el);
    },

    // Add all items in the Book collection at once.
    addAll: function(collection, filter) {
	this.$el.find("#list-bookhistory").html("");
	this.bookhistory.each(this.addOne);
    },

});

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
	this.genres.query = new Parse.Query(Genre);
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

	var genreName = this.$el.find("#newgenre").val();
	this.$el.find("#newgenre").val("");

	var genreObj = new Genre();
	var self = this;
	genreObj.save({
	    name: genreName
	}, {
	    success: function( genre ) {
		self.genres.add(genre);
		self.genres.sort();
		Notify.success("Genre was saved");
		self.hide();
		self.$el.find("#list-genre option:contains('" + genre.get("name") + "')").attr('selected', 'selected');
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

    tagName: 'div',

    events: {
	"click #addauthor": "add", 
	"click #removeauthor": "removeauthor", 
    },

    initialize: function() {

	_.bindAll(this, 'add', 'saveauthor', 'getauthor');

	var html = tpl.get('author'); 

	//var sign = (this.parent) ? 'plus' : 'minus';
	//var action = (this.parent) ? 'add' : 'remove';

	var render = {
	    firstname: this.model.get("firstname"),
	    lastname: this.model.get("lastname"),
	    sign: this.options.sign,
	    action: this.options.action
	};

	this.$el.addClass('input-pair-with-icon').html(Mustache.to_html(html, render));
	
    },

    validateAuthor: function() {
	return validate([ this.$el.find('#firstname'), this.$el.find('#lastname')]);
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

	this.model.destroy();

	if(this.options.parent)
	    this.options.parent.removeauthor(this);
	return false;
    },

    getauthor: function () {
	return {
	    firstname: this.$el.find("#firstname").val(),
	    lastname: this.$el.find("#lastname").val(),
	}
    },

    saveauthor: function(book) {
	var self = this;
	this.model.save({
	    firstname: self.$el.find("#firstname").val(),
	    lastname: self.$el.find("#lastname").val(),
	    book: book
	}); 
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

	_.bindAll(this, 'savebook', 'validateBook', 'addauthor', 'removeauthor', 'addOne', 'addAll' );

	this.authorViewList = [];

	if(!this.model.isNew()) {
	    var html = tpl.get('edit'); 
	    this.$el.html(Mustache.to_html(html, this.model.toJSON()));

	    this.authors = new Authors();
	    this.authors.query = new Parse.Query(Author);
	    this.authors.query.equalTo("book", this.model);
	    this.authors.query.ascending("createdAt");
	    this.authors.bind('reset', this.addAll);
	    this.authors.fetch();
	} else {
	    var html = tpl.get('add'); 
	    this.$el.html(Mustache.to_html(html, this.model.toJSON()));

	    var author = new Author();
	    this.addOne(author, true);
	}

	if(this.genresView) this.genresView.close();

	this.genresView = new GenreListView({
	    model: this.model,
	});
	this.$el.find("#genre").append(this.genresView.render().el);

	this.model.set("username", Parse.User.current().get("username"));
	this.model.set("user", Parse.User.current());
    },

    addOne: function(author, plus) {
	var sign = (plus) ? 'plus' : 'minus';
	var action = (plus) ? 'add' : 'remove';
      	var view = new AuthorView({
	    model: author,
	    parent: this,
	    sign: sign,
	    action: action
	});
	this.authorViewList.push(view);
	this.$el.find("#author").append(view.render().el);
    },

    // Add all items in the Book collection at once.
    addAll: function(collection, filter) {
    	this.$el.find("#author").empty();

    	//close all current views
    	for(var i =0, len = this.authorViewList.length; i < len; i++) {
    	    this.authorViewList[i].close();
    	}

    	if(this.authors.length == 0) {
    	    //SHORTTERM: backwards compatability
    	    var names = this.model.get("author").split(" ");
    	    var firstname = _.reduce(names.slice(0, names.length-1), 
    				     function (a, b) 
    				     { return a + " " + b }, ''
    				    );
    	    var lastname = names[names.length-1];

      	    var author = new Author({
      		firstname: firstname,
      		lastname: lastname
      	    });
      	    this.addOne(author, true);
      	} else {
      	    var first = true;
      	    this.authors.each(function (author) {
      		this.addOne(author, first);
      		first = false;
      	    }, this);
      	}
    },

    addauthor: function() {
	this.addOne(new Author(), false);
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
	if(this.submit) {
	    var result = true;
	    for(var i =0, len = this.authorViewList.length; i < len; i++) {
		result = this.authorViewList[i].validateAuthor() && result;
	    }
	    result = validate(['#bookname', '#totalpages', '#currpage']) && result;
	    return result;
	}
    },

    savebook: function() {
	
	this.submit = true;
	
	if(!this.validateBook()) {	
	    Notify.error("No empty boxes allowed");
	    return false;
	}

	if(parseFloat(this.$("#currpage").val()) > parseFloat(this.$("#totalpages").val())) {
	    this.$el.find("#currpage").addClass('error');			
	    Notify.warn("Have you read this book already?");
	    return false;
	}

	var self = this;

	var current = parseFloat(self.$el.find("#currpage").val());
	var total = parseFloat(self.$el.find("#totalpages").val());
	current = (current > total) ? total : current;
	current = (current < 0 ) ? 0 : current;
	total = (total < 0 ) ? 0 : total;

	var history = new BookHistory();
	history.set("page", current);
	history.set("book", self.model);
	history.save(null, {
	    success: function( history) {
		//NOP
	    },
	    error: function( history, error ){
		Notify.error("History: " + error.message);
	    }
	});
	
	self.model.set('name', self.$el.find("#bookname").val());
	self.model.set('author', self.$el.find("#author").val());
	self.model.set('genre',self.$el.find("#list-genre option:selected").text());  //TODO use val to get Id
	self.model.set('total', total);
	self.model.set('current', current);
	self.model.set('user', Parse.User.current());

	for(var i =0, len = self.authorViewList.length; i < len; i++) {
	    self.authorViewList[i].saveauthor(self.model);
	}

	self.model.save(null,{
	    success: function( author ) {
		window.location.hash = "#list";
	    },
	    error: function( author, error ) {
		Notify.error(error.message);
	    },
	});

	return false;
    }
});

var BookDetailsView = Parse.View.extend({

    el: "#book-details",
    //tagName: "div",

    events: {
	"click #edit":  	"edit",
	"click #save":  	"save", 
	"submit": 		"save", 
	"click #delete": 	"delete", 
	"click #shelf": 	"shelf", 
	"click #done": 		"done", 
	"click #history": 	"bookhistory", 
    },

    initialize: function() {
	
	_.bindAll(this, 'render', 'save', 'delete', 'shelf', 'done', 'is_active', 'switch_state');

	this.model.bind('change', this.render);
	this.model.bind('create', this.render);

	// state
	this.active = false;
    },

    is_active: function() {
	return this.active;
    },

    switch_state: function () {
	this.active = !this.active
	if(this.active)
	    this.$el.removeClass('hide');
	else
	    this.$el.addClass('hide');
    },

    render: function() {
	var query = new Parse.Query(Author);
	query.equalTo("book", this.model);

	var html = tpl.get('book-detail'); 
	this.$el.html(Mustache.to_html(html, this.model.toJSON()));
	this.$el.addClass("js-book-details");
	if(!this.active) {
	    this.$el.addClass('hide');
	}
	this.$el.attr('id', 'show_' + this.model.id);

	if(this.model.get("shelved")) {
	    this.$el.find("#shelf i").removeClass('icon-pause').addClass('icon-play');
	}
	var self = this;
	var authors = new Authors();
	authors.query = new Parse.Query(Author);
	authors.query.equalTo("book", this.model);
	authors.query.ascending("createdAt");
	authors.fetch({
	    success: function( authors ) {
		if(authors.length > 0) {
		    if(authors.length > 1) {
			self.$el.find("#plural").text("Authors: ");
		    }
		    var text = "";
		    authors.each(function ( author ){
			text += author.get("firstname") + " " + author.get("lastname") + ", "
		    });
		    if(text.endsWith(", "))
			text = text.slice(0, -2);
		    self.$el.find("#author").text(text);
		}
	    }
	});

	return this;
    },

    done: function() {
	if(confirm("Are you sure you want to mark book as done?")) {
	    var self = this;
	    var totalpages = parseFloat(this.model.get("total"));
	    this.model.save({
		done: true,
		current: totalpages
	    },{
		success: function( instance ) {
		    
		    //update history
		    var total = parseFloat(totalpages);
		    var history = new BookHistory();
		    history.set("page", total);
		    history.set("book", instance);
		    history.save(null, {
			success: function( history ) {
			    //NOP
			},
			error: function( history, error ){
			    Notify.error("History: " + error.message);
			}
		    });
		    
		    //render
		    self.options.parentView.options.parentView.render();
		    Notify.success("Book marked as done");
		},
		error: function(object, error) {
		    Notify.error(error.message);
		}
	    });
	}
	return false;
    },

    save: function() {

	var current = parseFloat(this.$el.find("#currpage").val());
	if(isNaN(current) || current < 0) {
	    this.$el.find("#currpage").addClass('error');
	    this.$el.find("#currpage").val(this.model.get("current"));
	    return;
	}
	this.$el.find("#currpage").removeClass('error');

	var total = parseFloat(this.model.get("total"));
	current = (current > total) ? total : current;
	current = (current < 0 ) ? 0 : current;

	var history = new BookHistory();
	history.set("page", current);
	history.set("book", this.model);
	history.save(null, {
	    success: function( history) {
		//NOP
	    },
	    error: function( history, error ){
		Notify.error("History: " + error.message);
	    }
	});
	
	var self = this;
	this.model.save({
	    current: current,
	    total: total,
	    user: Parse.User.current()
	},{
	    success: function( instance ) {
		self.options.parentView.render();
	    },
	    error: function(object, error) {
		Notify.error(error.message);
	    }
	});
	return false;
    },

    shelf: function() {
	var self = this;
	var shelfValue = !this.model.get("shelved");
	this.model.save({
	    shelved: shelfValue
	},{
	    success: function( instance ) {
		self.options.parentView.options.parentView.render();
		if(shelfValue)
		    Notify.success("Book was shelved");
		else
		    Notify.success("Book was unshelved");
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
    
    bookhistory: function() {
	window.location.hash = "#bookhistory/" + this.model.id;
	return false;
    },
    
    // Remove the item, destroy the model.
    delete: function() {
    	if(confirm("Are you sure you want to delete?")) {
    	    this.model.destroy();
	    this.options.parentView.remove();
	    return false;
      	}
      	return false;
    }
});

var BookView = Parse.View.extend({

    tagName: "li",

    events: {
	"click .js-book"   	: "details",
    },

    initialize: function() {
	_.bindAll(this, 'render', 'remove', 'details' );

	if(this.detailView) this.detailView.close();

	this.detailView = new BookDetailsView( {
	    model: this.model, 
	    parentView: this,
	});
    },

    render: function() {
	
	var html = tpl.get('book'); 	
	this.$el.html(Mustache.to_html(html, this.model.toJSON()));

	this.detailView.setElement(this.$el.find('#book-details')).render();

	if(this.model.get("shelved")) {
	    this.$el.find("#state").addClass("is-shelved");
	}
	if(this.model.get("done")) {

        this.$el.find("#state").addClass("is-done");
	    this.$el.find(".js-remove-on-done").remove()
	}
	return this;
    },

    details: function() {

        var isactive = this.$el.hasClass('is-active');

        //prepare
        $('#books li').removeClass('is-active');
        $('#shelvedbooks li').removeClass('is-active');
        $('#donebooks li').removeClass('is-active');	

        if(!isactive) {
            this.$el.addClass('is-active');
            util.scrollToTop(this.$el);
        } else {
            this.$el.removeClass('is-active');
        }

        return false;
    },
});

var BookListView = Parse.View.extend({

    el: "#content",
    
    events: {
	"click #logout": 		"logout",
	"click #add":   		"addnewbook",
	"click #showshelved":   "showshelved",
	"click #showdone":   	"showdone",	
    },

    initialize: function() {
	Notify.clear();

	_.bindAll(this, 'render', 'addOne', 'addAll', 'addAllshelved', 'addAllDone', 
		  'addOne', 'addOneshelved', 'addOneDone', 'fetchbooks',
		  'showshelved', 'showdone', 'defaultView', 'shelvedView', 'doneView' );

	this.render();
    },

    render: function(){

	var html = tpl.get('list'); 
	this.$el.html(html);

	if(window.location.hash == "#shelved") {
	    this.shelvedView()
	}
	else if(window.location.hash == "#done") {
	    this.doneView()
	}
	else {
	    this.defaultView()
	}

	return this;
    },


    defaultView: function(){
	this.books = this.fetchbooks(this.makeQueryRead);
	this.books.bind('add',     this.addOne);
     	this.books.bind('reset',   this.addAll);
     	this.books.comparator = function (book) {
     	    //for internal ordering .. 25% get -0,0000025 reduced.
     	    var add = -(book.nextMilestone() / 1000000);
	    return add + parseFloat(book.percentageLeft());
	}
	this.books.fetch();

	this.shelved = this.fetchbooks(this.makeQueryShelved);
     	this.shelved.bind('reset',   this.addAllshelved);
	this.shelved.fetch();

	this.done = this.fetchbooks(this.makeQueryDone);
	this.done.bind('reset',   this.addAllDone);
	this.done.fetch();
    },

    shelvedView: function() {
	this.$el.find("#shelvedbooks_content").removeClass('hide');
	this.$el.find("#shelvedbooks_content button").addClass('hide');
	this.$el.find("#books_content").addClass('hide');
	this.$el.find("#donebooks_content").addClass('hide');

	this.shelved = this.fetchbooks(this.makeQueryShelved, true);
	this.shelved.bind('reset',   this.addAllshelved);
	this.shelved.fetch();
    },

    doneView: function() {
	this.$el.find("#donebooks_content").removeClass('hide');
	this.$el.find("#donebooks_content button").addClass('hide');
	this.$el.find("#books_content").addClass('hide');
	this.$el.find("#shelvedbooks_content").addClass('hide');

	this.done = this.fetchbooks(this.makeQueryDone, true);
	this.done.bind('reset',   this.addAllDone);
	this.done.fetch();
    },

    showshelved: function() {	
	window.location.hash = "#shelved";
    },

    showdone: function() {
	window.location.hash = "#done";
    },

    makeQueryRead: function () {
	query = new Parse.Query(Book);
	query.notEqualTo("shelved", true); 
	query.notEqualTo("done", true);
	return query; 
    },

    makeQueryShelved: function (skipLimit) {
	query = new Parse.Query(Book);
	query.equalTo("shelved", true); 
	query.notEqualTo("done", true);
	if(!skipLimit) {
	    query.limit(5);
	}
	query.descending("updatededAt");
	return query; 
    },

    makeQueryDone: function (skipLimit) {
	query = new Parse.Query(Book);
	query.equalTo("done", true);
	if(!skipLimit) {
	    query.limit(5);
	}
	query.descending("updatedAt");
	return query; 
    },

    fetchbooks: function(query, skipLimit) {
	var books = new Books();
	books.query = query(skipLimit);
	books.query.equalTo("user", Parse.User.current());
	//books.query.equalTo("username", Parse.User.current().get("username"));
	return books;
    },

    // Add a single book item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(book) {
  	var view = new BookView({
	    model: book,
	    parentView: this
	});
  	this.$el.find("#books").append(view.render().el);
    },

    // Add all items in the Book collection at once.
    addAll: function(collection, filter) {
	this.$el.find("#books").html("");
	this.books.each(this.addOne);
    },

    addOneshelved: function(book) {
  	var view = new BookView({
	    model: book,
	    parentView: this
	});
  	this.$el.find("#shelvedbooks").append(view.render().el);
    },

    addAllshelved: function(collection, filter) {
	this.$el.find("#shelvedbooks").html("");
	this.shelved.each(this.addOneshelved);
    },

    addOneDone: function(book) {
  	var view = new BookView({
	    model: book,
	    parentView: this
	});
  	this.$el.find("#donebooks").append(view.render().el);
    },

    addAllDone: function(collection, filter) {
	this.$el.find("#donebooks").html("");
	this.done.each(this.addOneDone);
    },

    addnewbook: function() {
//	window.location.hash = "#add";
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

    events: {
	"click #newpassword": "sendpassword",
	"click #login": "login"
    },

    initialize: function() {
	var html = tpl.get('password'); 
	this.$el.html(html);
    },

    sendpassword: function() {

	var email = this.$el.find("#email").val()

	Notify.warn("Sending email ...");
	var self = this;
	Parse.User.requestPasswordReset(email, {
	    success: function() {
		self.$el.find("#newpass").addClass('hide');
		self.$el.find("#login").removeClass('hide');
		Notify.clear();
	    },
	    error: function(error) {
		Notify.error(error.message);
	    }
	});
    },
    
    login: function() {
	window.location.hash = "#login";
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
	this.render();
    },

    render: function() {
	Notify.clear();

	var html = tpl.get('login');
	this.$el.empty();
	this.$el.append(html);

	$.getScript("js/kickstart.js");
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

var AccountView = Parse.View.extend({

    el: "#content",

    events: {
	"click #logout": "logout", 
    },

    initialize: function() {
	this.render();
    },

    render: function() {
	this.$el.html(Mustache.to_html(tpl.get("account"), this.model.toJSON()));
    },

    logout: function() {
	Parse.User.logOut();
	window.location.hash = "#login";
	return false;
    }
});

var UtilityView = Parse.View.extend({

    el: "#utilities",

    events: {
	"click #add": 		"addbook", 
	"click #account" : 	"logout"
    },

    initialize: function() {
	if(Parse.User.current()) {
	    this.$el.removeClass('hide');
	} else {
	    this.$el.addClass('hide');
	}
    },

    addbook: function() {
	
	window.location.hash = "#add";
	return false;
    },

    logout: function() {
        window.location.hash = "#account";
        return false;
    }
});

Parse.View.prototype.close = function () {
    //console.log('Closing view ' + this.el.id);
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
	"": "index",
	"login": "login", 
	"signup":"login",
	"newpassword":"password",
	"list": "list", 
	"shelved": "list",
	"done": "list",
	"add": "add", 
	"edit/:id": "edit", 
	"details/:id": "details",
	"genre": "genre",  
	"genre/:id": "genre", 
	"book": "book",
	"suggest": "suggest",
	"bookhistory/:id": "bookhistory", 
	"account": "account", 
    },

    login: function() {
        return this.showView(
            null,
            LoginView,
            'Login'
        );
    },

    password: function() {
        return this.showView(
            null,
            PasswordView,
            'Reset Password'
        );
    },

    index: function() {
        if(!Parse.User.current()) this.login();
            return this.showView(
                null,
                BookListView,
                'Reading List'
            );
        },

    list: function() {
        if(!Parse.User.current()) this.login();
            return this.showView(
                null,
                BookListView,
                'Reading List'
            );
        },

    add: function() {
        if(!Parse.User.current()) this.login();
            return this.showView(
                new Book(),
                BookAddView,
                'Add book'
            );
        },

    edit: function(id) {
        if(!Parse.User.current()) this.login();
            return this.showViewQuery(
                id,
                Book,
                BookAddView,
                'Edit book'
            );
        },

    details: function(id) {
        if(!Parse.User.current()) this.login();
            return this.showViewQuery(id, Book, BookDetailsView);
        },

    bookhistory: function(id){
    if(!Parse.User.current()) this.login();
        return this.showViewQuery(
            id,
            Book,
            BookHistoryView,
            'Reading History'
        );
    },

    account: function(){
    if(!Parse.User.current()) this.login();
        return this.showView(
            Parse.User.current(),
            AccountView,
            'Account'
        );
    },

    showViewQuery: function(id, Constructor, View, pagetitle) {
        var self = this;
        var query = new Parse.Query(Constructor);
        query.get(id, {
            success: function(book) {
                self.showView(
                    book,
                    View,
                    pagetitle
                );
            },
            error: function(object, error) {
                Notify.error(error.message);
            }
        });
    },

    showView: function(model, View, pagetitle) {


        if (pagetitle) {
            if (model !== null) {
                $('title').text( model._serverData.name +' - '+ pagetitle +' - ' + appName);
            } else {
                $('title').text(pagetitle +' - ' + appName);
            }
        } else {
            $('title').text(appName);
        }

        if(this.utilityView) this.utilityView.close();

        this.utilityView = new UtilityView();

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
	'genre-edit',
	'book-history',
	'book-history-item',
	'account'], 
		      function () {
			  new AppRouter();
			  Parse.history.start();
		      });
 });
