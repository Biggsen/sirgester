define(['knockout', 'text!./add.html', 'jquery', 'api', 'utils'], function(ko, template, $, api, utils){

  function AddViewModel(route) {
    var self = this;

    this.title = ko.observable("");
    this.firstName = ko.observable("");
    this.lastName = ko.observable("");
    this.genres = ko.observableArray([]);
    this.selectedGenre = ko.observable();
    this.total = ko.observable(0);
    this.current = ko.observable(0);

    api.get('/genre', function(data){
      $.map(data, function( val, i ) {
        self.genres.push(val);
      });

      self.genres.sort(utils.sort('name', 'asc'));

      if(self.genres().length > 0)
      {
        self.selectedGenre(self.genres()[0]);
      }
    });

    this.savebook = function() {
      var now = new Date();
      var bookId = utils.hash(self.title());
      var authorId = utils.hash(self.firstName()+self.lastName());

      api.create('/book', {
        user_objectid: sessionStorage.userid,
        objectid: bookId,
        name: self.title(),
        current: self.current(),
        total: self.total(),
        done: false,
        shelved: false,
        genre: self.selectedGenre()["name"],
        updatedat: now.toISOString(),
        createdat: now.toISOString()
      }, function() {
        window.location.hash = '#';  
      });

      api.create('/author', {
        objectid: authorId,
        book_objectid: bookId,
        firstname: self.firstName(),
        lastname: self.lastName(),
        updatedat: now.toISOString(),
        createdat: now.toISOString()
      });
    }
  }

  return { viewModel: AddViewModel, template: template }
});