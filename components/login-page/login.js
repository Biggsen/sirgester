define(['knockout', 'text!./login.html'], function(ko, template){

  var bookId = '584b186a8ff5480300d05fad';
  var baseUrl = 'https://api.fieldbook.com/v1/' + bookId;
  var appKey = "vA-OFzmGzxX0UtlZfVUk"

  function LoginViewModel(route) {
      var self = this;

      this.username = ko.observable("biggs");
      this.password = ko.observable("biggs");

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
            sessionStorage.userid = data[0].objectid;
            window.location.hash = '#';
          } else {
            delete sessionStorage.userid;
          }
        })
        .fail(function(er) {
          console.log(er);
        })
        .always(function() {
          console.log(sessionStorage.userid);
        });
      };
  }

  return { viewModel: LoginViewModel, template: template }
});