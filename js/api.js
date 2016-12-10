define(function(require, exports, module) {

  var bookId = '584b186a8ff5480300d05fad';
  var baseUrl = 'https://api.fieldbook.com/v1/' + bookId;
  var appKey = "vA-OFzmGzxX0UtlZfVUk";

  var api = {
    get: function (url, callback){
      $.ajax({
          type: 'GET',
          url: baseUrl + url,
          headers: {
              "accept":"application/json",
          },
          beforeSend : function(xhr) {
            var basic = "Basic " + btoa("key-1" + ":" + appKey);
            xhr.setRequestHeader("Authorization", basic);
          },
        })
        .done(function(data) {
          callback(data);
        })
        .fail(function(er) {
          console.log(er);
        })
        .always(function() {
          //console.log( "complete" );
        });
    }
  }

  module.exports = api;
});
