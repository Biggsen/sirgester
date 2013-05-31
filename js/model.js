var BookHistory = Parse.Object.extend("BookHistory", {
	defaults:{
		page: 0,
		book: null
	}
});

var BookHistorys = Parse.Collection.extend({
	model: BookHistory
});

var Author = Parse.Object.extend("Author", {
	defaults: {
		firstname: '',
		lastname: '',
		book: null
	}
});

var Authors = Parse.Collection.extend({
	model: Author,
});


var Genre = Parse.Object.extend("Genre", {
	defaults: {
		name: '',
	}
});

var Genres = Parse.Collection.extend({
	model: Genre,
});


var Book = Parse.Object.extend("Book", {

	initialize: function() {
		_.bindAll(this, 'toJSON' );	
	},

	defaults : {
		"id": null,
		"name": "",
		"genre" : "",
		//"author": "",
		"totalpages": "100",
		"currentPage": "0",
		"total": 100,
		"current": 0,
		"shelfed": false,
		"done": false
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