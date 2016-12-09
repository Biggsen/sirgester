var bookId = '584b186a8ff5480300d05fad';
var baseUrl = 'https://api.fieldbook.com/v1/' + bookId;

var appKey = "vA-OFzmGzxX0UtlZfVUk"

var url = baseUrl + '/book';
var jqxhr = $.ajax({
    type: 'GET',
    url: url,
    headers: {
        "accept":"application/json",
    },
    beforeSend : function(xhr) {
      var basic = "Basic " + btoa("key-1" + ":" + appKey);
      xhr.setRequestHeader("Authorization", basic);
    },
  })
  .done(function(data) {
    console.log(data);
    viewModel.books(data);
  })
  .fail(function(er) {
    console.log(er);  
  })
  .always(function() {
    //console.log( "complete" );
  });

var user = function() {
    this.first = ko.observable(),
    this.last = ko.observable(),
    this.login = function() {
      if(this.first() == "Biggs") {
        alert('yey')
      } else {
        alert('sag')
      }
    }.bind(this);
};

var viewModel = {
    user: user,
    loggedin: true,
    books: ko.observableArray()
};

ko.applyBindings(viewModel);