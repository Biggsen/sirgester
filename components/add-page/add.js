define(['knockout', 'text!./add.html'], function(ko, template){

  function HomeViewModel(route) {
      this.search = ko.observable("hi");
  }

  return { viewModel: HomeViewModel, template: template }
});