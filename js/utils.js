define(function(require, exports, module) {

  var utils = {
    hash: function(str){
      var hash = 0;
      if (str.length == 0) return hash;
      for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    },
    sort: function (orderby, dir) {
      var result = null;

      var f = function (obj) 
      { 
        if(typeof(obj) === "function") {
          obj = obj();
        }

        return obj; 
      }

      if (dir && dir === 'desc') {
        result = function (b, a) {
            return f(a[orderby]) < f(b[orderby]) ? -1 : f(a[orderby]) > f(b[orderby]) ? 1 : f(a[orderby]) == f(b[orderby]) ? 0 : 0;
        }
      } else {
        result = function (a, b) {
            return f(a[orderby]) < f(b[orderby]) ? -1 : f(a[orderby]) > f(b[orderby]) ? 1 : f(a[orderby]) == f(b[orderby]) ? 0 : 0;
        };  
      }

      return result;
    }
  }

  module.exports = utils;
});