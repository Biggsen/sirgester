define(['knockout', 'text!./books.html', 'api'], function(ko, template, api){
  
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

        record.mileStonePage = self.nextMilestone(record.total, record.current);
        record.nextMileStone = self.pagesToNextMilestone(record.total, record.current);
        record.percentage = self.percentage(record.total, record.current);
        record.percentageLeft = self.percentageLeft(record.total, record.current);
      });
    };

    this.percentage = function(total, current) {
      return ((current / total) * 100).toFixed(2);
    };

    this.percentageLeft = function(total, current) {
      var milestone = self.nextMilestone(total, current);
      var perc = self.percentage(total, current);
      return (milestone - perc).toFixed(2);
    };

    this.pagesToNextMilestone = function ( total, current ) {
      var result  = self.mileStonePage( self.nextMilestone( total, current), total ) - current;
      if( result < 0 )
        return 0;
      return result;
    };

    this.nextMilestone = function (total, current) {
      var milestones = [25,50,75,100];
      for (var i = 0, len = milestones.length; i < len; i++) {
        var result = self.pagesToMilestone( milestones[i], total, current );
        if( result > 0 )
          return milestones[i];
      }
      return 0;
    };

    this.pagesToMilestone = function ( milestone, total, current ) {
        var result  = self.mileStonePage( milestone, total ) - current;
      if( result < 0 )
        return 0;
      return result;
    };

    this.mileStonePage = function ( milestone, total ) {
      return (( milestone * total ) / 100).toFixed(0);
    };
  }

  return { viewModel: BooksViewModel, template: template }
});