define(['knockout', 'text!./books.html'], function(ko, template){
  
  var bookId = '584b186a8ff5480300d05fad';
  var baseUrl = 'https://api.fieldbook.com/v1/' + bookId;
  var appKey = "vA-OFzmGzxX0UtlZfVUk"

  if(!sessionStorage.userid) {
    window.location.hash = '#login';
  }

  function BooksViewModel(route) {
    var self = this;

    this.search = ko.observable("hi");
    this.books = ko.observableArray();

    var url = baseUrl + '/book?user_objectid=' + sessionStorage.userid;
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
        self.books(data);
      })
      .fail(function(er) {
        console.log(er);
      })
      .always(function() {
        //console.log( "complete" );
      });
  }

  return { viewModel: BooksViewModel, template: template }
});