var bookId = '584b186a8ff5480300d05fad';
var baseUrl = 'https://api.fieldbook.com/v1/' + bookId;
var appKey = "vA-OFzmGzxX0UtlZfVUk"

var UserView = function() {
    var self = this;

    this.username = ko.observable("biggs"),
    this.password = ko.observable("biggs"),
    this.login = function() {
      var url = baseUrl + '/user?bcryptpassword=' + btoa(self.username() + ":" + self.password());
      $.ajax({
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
        if(data.length > 0) {
          sessionStorage.loggedin = true;
          sessionStorage.userid = data[0].objectid;
          viewModel.loggedin(true);
        }
      })
      .fail(function(er) {
        console.log(er);
      });
    };
};

var BookView = function() {
  var self = this;
  self.books = ko.observableArray();
}


var ViewModel = function() {
  this.user = new UserView();
  this.booksView = new BookView();
  this.loggedin = ko.observable(sessionStorage.loggedin == 'true');

  this.loggedin.subscribe(function(val){
    console.log('subscribe');
    var url = baseUrl + '/book?user_objectid=' + sessionStorage.userid;
    if(val == true){
      $.ajax({
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
        viewModel.booksView.books(data);
      })
      .fail(function(er) {
        console.log(er);
      })
      .always(function() {
        //console.log( "complete" );
      });
    }
  });
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

$(document).ready(function() {
  if(viewModel.loggedin() === true) {
    console.log('notify');
    viewModel.loggedin.notifySubscribers(true)
  }
});
