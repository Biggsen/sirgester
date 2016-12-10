define(['knockout', 'text!./login.html', 'api'], function(ko, template, api){

  function LoginViewModel(route) {
      var self = this;

      this.username = ko.observable("biggs");
      this.password = ko.observable("biggs");

      this.login = function() {
        var url = '/user?bcryptpassword=' + btoa(self.username() + ":" + self.password());
        api.get(url, function(data){
          if(data.length > 0) {
            sessionStorage.userid = data[0].objectid;
            window.location.hash = '#';
          } else {
            delete sessionStorage.userid;
          }
        });
      };
  }

  return { viewModel: LoginViewModel, template: template }
});