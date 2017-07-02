define(['knockout', 'text!./books.html', 'jquery', 'api', 'calc', 'utils'], function(ko, template, $, api, calc, utils){

  if(!sessionStorage.userid) {
    window.location.hash = '#login';
  }

  function BookViewModel(book) {
    var self = this;

    self.name = ko.observable(book.name);
    self.genre = ko.observable(book.genre);
    self.current = ko.observable(book.current);
    self.total = book.total;
    self.updatedat = book.updatedat;
    self.objectid = book.objectid;
    self.id = book.id;
    self.authors = ko.observable("fetching author ...");

    if(book.author) { // backwards compatability
      self.authors(book.author);
    }

    var url = '/author?book_objectid=' + book.objectid;
    api.get(url, function(data){

      var authors = [];
      $.map(data, function( val, i ) {
        authors.push(val['firstname'] + ' ' + val['lastname']);
      });

      if(authors.length > 0) {
        self.authors(authors.join(', '));
      }
    });

    self.updatePage = function(obj) {

      var selector = "#" + obj.objectid + " input[type=number]";
      var val = $(selector).val();
      val = (!val) ? 0 : parseInt(val);
      val = (val < 0) ? 0 : val;

      var url = '/book/' + obj.id;
      var partial = {current: val };
      api.update(url, partial);

      obj.current(val);
      obj.updateInfo(obj.total, obj.current());
    }

    self.left = ko.observable();
    self.milestonePage = ko.observable();
    self.nextMilestone = ko.observable();
    self.percentage = ko.observable();
    self.percentageLeft = ko.observable();

    self.updateInfo = function(total, current) {
      self.left(total - current);
      self.milestonePage(calc.nextMilestone(total, current));
      self.nextMilestone(calc.pagesToNextMilestone(total, current));
      self.percentage(calc.percentage(total, current));
      self.percentageLeft(calc.percentageLeft(total, current));
    }

    self.book = book;
    self.updateInfo(book.total, book.current);
  }

  function BooksViewModel(route) {
    var self = this;

    this.books = ko.observableArray();
    this.done = ko.observableArray();
    this.shelved = ko.observableArray();

    var url = '/book?user_objectid=' + sessionStorage.userid;
    api.get(url, function(data){
      self.update(data);
      self.books.sort(utils.sort('nextMilestone', 'asc'));
      self.shelved.sort(utils.sort('updatedat', 'desc'));
      self.done.sort(utils.sort('updatedat', 'desc'));
    });

    this.orderbyMilestone = function() {
      self.books.sort(utils.sort('nextMilestone', 'asc'));
    }

    this.orderbyLeft = function() {
      self.books.sort(utils.sort('left', 'asc'));
    }

    this.update = function (books) {
      $.each(books, function (index, record) {

        if(record.done && record.done == 'true') {
          self.done.push(new BookViewModel(record));
        } else if(record.shelved && record.shelved == 'true') {
          self.shelved.push(new BookViewModel(record));
        } else {
          self.books.push(new BookViewModel(record));
        }

      });
    };
  }

  return { viewModel: BooksViewModel, template: template }
});