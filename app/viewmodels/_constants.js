(function(){
    "use strict";

    window.room_planner = window.room_planner || {};
    window.room_planner.factor = 30 * 60000;
    window.room_planner.cellHeight = 50;
    window.room_planner.getHeight = function(){
        return window.room_planner.factor * window.room_planner.cellHeight;
    };

}).call(this);