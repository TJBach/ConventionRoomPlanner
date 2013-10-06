(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.Cell = function(time){
        var self = this;
        var date = new Date(time);

        self.height = window.room_planner.getHeight();

        self.dateText = (date.getHours() == 0 && date.getMinutes() == 0)
            ? date.toDateString()
            : date.toLocaleTimeString();
    };

}).call(this);