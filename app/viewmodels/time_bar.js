(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    room_planner.TimeBar = function(grid){
        var self = this;

        self.template = "time-template";
        self.name = ko.observable("Time");
        self.class = "times";

        self.rows = grid.rows;
    };

}).call(this);