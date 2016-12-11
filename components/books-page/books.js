define(['knockout', 'text!./books.html', 'api', 'calc'], function(ko, template, api, calc){
  
  if(!sessionStorage.userid) {
    window.location.hash = '#login';
  }

  function BooksViewModel(route) {
    var self = this;

    this.books = ko.observableArray();

    var url = '/book?user_objectid=' + sessionStorage.userid;
    api.get(url, function(data){
      self.update(data);
      self.books(data);
    });

    this.update = function (books) {
      $.each(books, function (index, record) {
        record.left = record.total - record.current;

        record.mileStonePage = calc.nextMilestone(record.total, record.current);
        record.nextMileStone = calc.pagesToNextMilestone(record.total, record.current);
        record.percentage = calc.percentage(record.total, record.current);
        record.percentageLeft = calc.percentageLeft(record.total, record.current);
      });
    };
  }

  return { viewModel: BooksViewModel, template: template }
});