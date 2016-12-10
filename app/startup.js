define(['jquery', 'knockout', './router'], function($, ko, router){
  ko.components.register('login-page', { require: 'components/login-page/login' });

  ko.components.register('books-page', { require: 'components/books-page/books' });

  ko.applyBindings({ route: router.currentRoute });
});