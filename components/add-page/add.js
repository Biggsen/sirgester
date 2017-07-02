define(['knockout', 'text!./add.html', 'jquery', 'api', 'utils'], function(ko, template, $, api, utils){

  function AddViewModel(route) {
    var self = this;

    this.title = ko.observable("Forgive me, I just sold my only friend!");
    this.firstName = ko.observable("Stone");
    this.lastName = ko.observable("Gislason");
    this.genres = ko.observableArray([]);
    this.total = ko.observable(150);
    this.current = ko.observable(3);

    var url = '/genre';
    api.get(url, function(data){
      $.map(data, function( val, i ) {
        self.genres.push(val);
      });

      self.genres.sort(utils.sort('name', 'asc'));
    });

    this.savebook = function() {
      alert('saving book');
      console.log(utils.hash('stone'));
    }
  }

  return { viewModel: AddViewModel, template: template }
});