define(function(require, exports, module) {

  var calc = {
    percentage: function(total, current) {
      return ((current / total) * 100).toFixed(2);
    },

    percentageLeft: function(total, current) {
      var milestone = this.nextMilestone(total, current);
      var perc = this.percentage(total, current);
      return (milestone - perc).toFixed(2);
    },

    pagesToNextMilestone: function ( total, current ) {
      var result  = this.milestonePage( this.nextMilestone( total, current), total ) - current;
      if( result < 0 )
        return 0;
      return result;
    },

    nextMilestone: function (total, current) {
      var milestones = [25,50,75,100];
      for (var i = 0, len = milestones.length; i < len; i++) {
        var result = this.pagesToMilestone( milestones[i], total, current );
        if( result > 0 )
          return milestones[i];
      }
      return 0;
    },

    pagesToMilestone: function ( milestone, total, current ) {
        var result  = this.milestonePage( milestone, total ) - current;
      if( result < 0 )
        return 0;
      return result;
    },

    milestonePage: function ( milestone, total ) {
      return (( milestone * total ) / 100).toFixed(0);
    }
  }

  module.exports = calc;
});