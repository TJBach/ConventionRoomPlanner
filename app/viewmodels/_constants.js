(function(){
    "use strict";

    window.room_planner = window.room_planner || {};
    window.room_planner.factor = 30 * 60000;
    window.room_planner.cellHeight = 30;
    window.room_planner.getHeight = function(){
        return window.room_planner.factor * window.room_planner.cellHeight;
    };
    window.room_planner.getSize = function(timespan){
        return timespan / window.room_planner.factor * window.room_planner.cellHeight;
    };

    var socket =  io.connect();

    window.room_planner.getSocket = function(){
        return socket;
    };

}).call(this);