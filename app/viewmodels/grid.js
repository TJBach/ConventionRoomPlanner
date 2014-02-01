(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    var getNextDay = function(date){
        var next = new Date(date);
        next.setDate(date.getDate()+1);
        return next;
    };

    var getToday = function(){
        var date = new Date();

        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        date.setHours(0);

        return date;
    };

    var normalizeDate = function(date){
        var newDate = new Date(date);

        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        newDate.setHours(newDate.getHours());

        return newDate;
    };

    var getEventTimeSpan = function(convention){
        var startDate, endDate, i, z;
        var start, end;
        if(convention && convention.rooms){
            for(i = 0; i < convention.rooms.length; i++){
                var events = convention.rooms[i].events;

                for(z = 0; z < events.length; z++){
                    start = new Date(events[z].start);
                    end = new Date(events[z].end);
                    if(!startDate || startDate > start){
                        startDate = start;
                    }
                    if(!endDate || endDate < end){
                        endDate = end;
                    }
                }
            }
        }

        startDate = startDate || getToday();
        var nextDay = getNextDay(startDate);

        if(!endDate || endDate < nextDay){
            endDate = nextDay;
        }

        return {
            start: normalizeDate(startDate),
            end: normalizeDate(endDate)
        }
    };

    var socket = room_planner.getSocket();

    room_planner.Grid = function(convention){
        var self = this;

        var startingDates = getEventTimeSpan(convention);

        var conventionId = convention._id;
        var startTime = startingDates.start;
        var endTime = startingDates.end;

        self._id = ko.observable(conventionId);
        self.chat = new room_planner.ChatClient(conventionId);

        self.startTime = ko.observable(startTime);
        self.endTime = ko.observable(endTime);

        self.rows = ko.dependentObservable(function(){
            var start = self.startTime() || new Date();
            var end = self.endTime() || new Date();
            var factor = window.room_planner.factor;
            var difference = end - start;
            var count = Math.ceil(difference / factor);
            var time, startTime = start.getTime();
            var rows = [];

            for(var i = 0; i < count; i++){
                time = startTime + i*factor;
                rows.push(new room_planner.Cell(time));
            }

            return rows;
        });

        self.columns = ko.observableArray([new room_planner.TimeBar(self)]);

        self.rooms = ko.dependentObservable(function(){
            return self.columns().slice(1);
        });

        self.displayMode = function(column){
            return column.template;
        };

        self.addRoom = function(model){
            var room = new room_planner.Room(self, model);
            self.columns.push(room);
            return room;
        };

        self.removeRoom = function(room){
            self.columns.remove(room);
        };

        self.findRoom = function(id){
            return _.find(self.rooms(), function(room){ return room._id() == id });
        };

        self.findEvent = function(eventId){
            var rooms = self.rooms();

            for(var i = 0; i < rooms.length; i++){
                var events = rooms[i].events();

                for(var z = 0; z < events.length; z++){
                    if(events[z]._id() == eventId){
                        return events[z];
                    }
                }
            }
        };

        //Computed Properties
        self.totalEvents = ko.dependentObservable(function() {
            var count, eventCount = 0;
            var rooms = self.columns();

            for(count = 1; count < rooms.length; count++){
                eventCount += rooms[count].events().length;
            }
            return eventCount;
        });

        self.planerWidth = ko.dependentObservable(function() {
            var rooms = self.columns();

            return (((rooms.length-1) * 210) + 210) + "px";
        });

        //events
        self.uiRemoveRoom = function(room){
            self.removeRoom(room);

            socket.emit('room:remove', ko.toJS(room), function(response){
                if(response.error){
                    self.addRoom(room);
                }
            });
        };

        self.promptForNewRoom = function(){
            room_planner.modal.show({
                viewModel: new room_planner.AddRoomViewModel(),
                template: 'add-room-template'
            }).done(function(model) {
                var json = ko.toJS(model);
                var room = new room_planner.Room(self, json);
                socket.emit('room:add', ko.toJS(room), function(response){
                    if(!response.error){
                        self.addRoom(response.room[0] || response.room);
                    }
                });
            }).fail(function() {
                console.log("Modal cancelled");
            });
        };

        self.promptForNewEvent = function(){
            if(self.columns().length < 2){
                return;
            }

            var start = self.startTime();
            var end = new Date(start.getTime() + window.room_planner.factor);
            var room = self.columns()[1];

            room_planner.modal.show({
                viewModel: new room_planner.AddEventViewModel(self, start, end, room),
                template: 'add-event-template'
            }).done(function(model) {
                var room = model.room();
                //var event = room.addEvent(ko.toJS(model));
                var event = new room_planner.Event(self, room, model);
                socket.emit('event:add', ko.toJS(event), function(response){
                    if(!response.error){
                        model.room().addEvent(response.event[0] || response.event);
                    }
                });
            });
        };
    };

}).call(this);