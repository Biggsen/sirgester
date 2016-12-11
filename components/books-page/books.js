define(['knockout', 'text!./books.html', 'api', 'calc'], function(ko, template, api, calc){

  if(!sessionStorage.userid) {
    window.location.hash = '#login';
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

    this.update = function (books) {
      $.each(books, function (index, record) {
        record.left = record.total - record.current;
        record.milestonePage = calc.nextMilestone(record.total, record.current);
        record.nextMilestone = calc.pagesToNextMilestone(record.total, record.current);
        record.percentage = calc.percentage(record.total, record.current);
        record.percentageLeft = calc.percentageLeft(record.total, record.current);

        if(record.done && record.done == 'true') {
          self.done.push(record);
        } else if(record.shelved && record.shelved == 'true') {
          self.shelved.push(record);
        } else {
          self.books.push(record);
        }
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