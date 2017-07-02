define(['knockout', 'text!./add.html', 'api', 'utils'], function(ko, template, api, utils){

  function AddViewModel(route) {
    this.title = ko.observable("Forgive me, I just sold my only friend!);
    this.firstName = ko.observable("Stone");
    this.lastName = ko.observable("Gislason");
    this.genres = ko.observableArray(["Sci-Fi", "Action", "Dev"]);
    this.total = ko.observable(150);
    this.current = ko.observable(3);

    this.savebook = function() {
      alert('saving book');
      console.log(utils.hash('stone'));
    }
  }

  return { viewModel: AddViewModel, template: template }
});