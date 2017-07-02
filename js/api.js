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
          if(typeof(callback) == 'function') {
            callback(data);  
          }
        })
        .fail(function(er) {
          console.log(er);
        })
        .always(function() {
          //console.log( "complete" );
        });
    },
    update: function(url, partial, callback) {
      $.ajax({
          type: 'PATCH',
          url: baseUrl + url,
          headers: {
              "accept":"application/json",
              "Content-Type": "application/json"
          },
          beforeSend : function(xhr) {
            var basic = "Basic " + btoa("key-1" + ":" + appKey);
            xhr.setRequestHeader("Authorization", basic);
          },
          data : JSON.stringify(partial)
        })
        .done(function(data) {
          if(typeof(callback) == 'function') {
            callback(data);  
          }
        })
        .fail(function(er) {
          console.log(er);
        })
        .always(function() {
          //console.log( "complete" );
        });
    },
    create: function(url, record, callback) {
      $.ajax({
          type: 'POST',
          url: baseUrl + url,
          headers: {
              "accept":"application/json",
              "Content-Type": "application/json"
          },
          beforeSend : function(xhr) {
            var basic = "Basic " + btoa("key-1" + ":" + appKey);
            xhr.setRequestHeader("Authorization", basic);
          },
          data : JSON.stringify(record)
        })
        .done(function(data) {
          if(typeof(callback) == 'function') {
            callback(data);  
          }
        })
        .fail(function(er) {
          console.log(er);
        })
        .always(function() {
          //console.log( "complete" );
        });
    },
    delete: function(url, callback) {
      $.ajax({
          type: 'DELETE',
          url: baseUrl + url,
          headers: {
              "accept":"application/json",
              "Content-Type": "application/json"
          },
          beforeSend : function(xhr) {
            var basic = "Basic " + btoa("key-1" + ":" + appKey);
            xhr.setRequestHeader("Authorization", basic);
          }
        })
        .done(function(data) {
          console.log('delete done');
        })
        .fail(function(er) {
          console.log(er);
        })
        .always(function() {
          console.log( "complete" );
          if(typeof(callback) == 'function') {
            callback();  
          }
        });
    }
  }

  module.exports = api;
});