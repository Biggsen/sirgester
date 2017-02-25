define(['knockout', 'text!./books.html', 'api', 'calc'], function(ko, template, api, calc){

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

    self.updatePage = function(obj) {
      var selector = "#" + obj.objectid + " input[type=number]";
      console.log(selector);
      var val = $(selector).val();
      val = (!val) ? 0 : val;
      val = (val < 0) ? 0 : val;
      console.log(val);
      
      obj.current(parseInt(val));
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
      self.books.sort(self.sorthandler('nextMilestone', 'asc'));
      self.shelved.sort(self.sorthandler('updatedat', 'desc'));
      self.done.sort(self.sorthandler('updatedat', 'desc'));
    });

    this.orderbyMilestone = function() {
      self.books.sort(self.sorthandler('nextMilestone', 'asc'));
    }

    this.orderbyLeft = function() {
      self.books.sort(self.sorthandler('left', 'asc'));
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
        
        /*
        record.updateInfo = function(info) {
          info.left = ko.observable(info.total - info.current);
          info.milestonePage = calc.nextMilestone(info.total, info.current);
          info.nextMilestone = calc.pagesToNextMilestone(info.total, info.current);
          info.percentage = calc.percentage(info.total, info.current);
          info.percentageLeft = calc.percentageLeft(info.total, info.current);  
        }

        record.updatePage = function(obj, e) {
          obj.current = 2;
          obj.updateInfo(obj);
          document.debug = obj;
          console.log(obj);
        }

        record.updateInfo(record);

        */
      });
    };

    this.sorthandler = function (orderby, dir, f) {
      var result = null;

      if (!f) {
          f = function (obj) { return obj; }
      }


      if (dir && dir === 'desc') {
        result = function (b, a) {
            return f(a[orderby]) < f(b[orderby]) ? -1 : f(a[orderby]) > (b[orderby]) ? 1 : f(a[orderby]) == f(b[orderby]) ? 0 : 0;
        }
      } else {
        result = function (a, b) {
            return f(a[orderby]) < f(b[orderby]) ? -1 : f(a[orderby]) > f(b[orderby]) ? 1 : f(a[orderby]) == f(b[orderby]) ? 0 : 0;
        };
      }

      return result;
    };
  }

  return { viewModel: BooksViewModel, template: template }
});