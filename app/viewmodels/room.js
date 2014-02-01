(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    var eventCreation = {
        creatingStart: null,
        row: null
    };

    var sortEventsByStartThenEnd = function(left, right){
        var sort = left.start() - right.start();

        return sort == 0
            ? (left.end() - right.end())
            : sort;
    };

    var eventsOverlap = function ( left, right )
    {
        return left.end() > right.start() && left.start() < right.end();
    };

    var expandEvent = function(event, index, columns)
    {
        var i, z, colSpan = 1;
        var column, columnEvent;

        for(i = index+1; i < columns.length; i++){
            column = columns[i];

            for(z = 0; z < column.length; z++){
                columnEvent = column[z];

                if(eventsOverlap(columnEvent, event)){
                    return colSpan;
                }
            }
            colSpan++;
        }
        return colSpan;
    };

    var scaleEvent = function (columns)
    {
        var events, event, i, j;
        var colSpan;

        for (i = 0; i < columns.length; i++) {
            events = columns[i];

            for (j = 0; j < events.length; j++)
            {
                event = events[j];

                colSpan = expandEvent(event, i, columns);
                event.shift(i);
                event.columns(columns.length);
                event.span(colSpan);
            }
        }
    };

    var setEventOverlap = function(events){
        var i, z, current, last;
        var columns = [];
        var placed, column;

        events = events.sort(sortEventsByStartThenEnd);

        for(i = 0; i < events.length; i++){
            current = events[i];

            if (last && current.start() >= last.end()) {
                scaleEvent(columns);
                columns = [];
                last = null;
            }

            placed = false;
            for (z = 0; z < columns.length && !placed; z++) {
                column = columns[z];
                placed = !eventsOverlap( column[column.length-1], current );

                if (placed) {
                    column.push(current);
                }
            }

            if (!placed) {
                columns.push([current]);
            }

            if (!last || current.end() > last.end()) {
                last = current;
            }
        }

        if (columns.length > 0) {
            scaleEvent( columns );
        }
    };

    var socket = room_planner.getSocket();

    room_planner.Room = function(grid, model){
        var self = this;

        self._id = ko.observable(model._id);
        self.conId = ko.observable(grid._id());

        self.name = ko.observable(model.name);
        self.description = ko.observable(model.description);
        self.events = ko.observableArray();
        self.rows = grid.rows;
        self.template = "room-template";
        self.creating = ko.observable(false);

        self.reserve = ko.observable(false);

        self.visibleEvents = ko.dependentObservable(function(){
            return ko.utils.arrayFilter(self.events(), function(event) {
                return event.shown();
            });
        });

        self.events.subscribe(function() {
            setEventOverlap(self.events());
        });

        self.addEvent = function(model){
            var event = new room_planner.Event(grid, self, model);
            self.events.push(event);
            return event;
        };

        self.removeEvent = function(event){
            self.events.remove(event);
        };

        self.markStart = function(row){
            eventCreation.creatingStart = row.date;
            eventCreation.started = true;

            self.creating(true);
            row.creating(true);
        };

        self.mark = function(row){
            row.creating(eventCreation.started);
        };

        self.cancelCreate = function(room){
            eventCreation.started = false;
            room.creating(false)

            var rows = self.rows();
            for(var count = 0; count < rows.length; count++){
                rows[count].creating(false);
            }
        };

        self.findEvent = function(id){
            return _.find(self.events(), function(event){ return event._id() == id });
        };

        //
        self.uiRemoveEvent = function(event){
            self.removeEvent(event);

            socket.emit('event:remove', ko.toJS(event), function(response){
                if(response.error){
                    self.addEvent(event);
                }
            });
        };

        self.promptNewEvent = function(row){
            if(!eventCreation.started){
                return;
            }

            var start = eventCreation.creatingStart || row.date;
            var end = new Date(row.date.getTime() + window.room_planner.factor);
            var room = self;

            room_planner.modal.show({
                viewModel: new room_planner.AddEventViewModel(grid, start, end, self),
                template: 'add-event-template'
            }).done(function(model) {
                var room = model.room();
                //var event = room.addEvent(ko.toJS(model));
                var event = new room_planner.Event(grid, room, model);
                socket.emit('event:add', ko.toJS(event), function(response){
                    if(!response.error){
                        self.addEvent(response.event[0] || response.event);
                    }
                });
            }).fail(function() {
                console.log("Modal cancelled");
            }).always(function() {
                self.cancelCreate(room);
            });
        };

        self.promptForEditRoom = function(){
            room_planner.modal.show({
                viewModel: new room_planner.EditRoomViewModel(self),
                template: 'add-room-template'
            });
        };

        self.dropEvent = function(eventContext, roomContext, evt, ui){
            var event = eventContext.$data;
            var oldRoom = eventContext.$parent;

            var top, eventTop = ui.draggable.offset().top;
            var cells = $(evt.target).children();
            var found = false;
            var current = 0;
            var cell;
            var originalDate = event.start();

            while(!found && current < cells.length){
                top = $(cells[current]).offset().top + (window.room_planner.cellHeight/2);
                found = top >= eventTop;
                current++;
            }

            oldRoom.events.remove(event);

            if(found){
                cell = ko.dataFor(cells[current-1]);
                event.rootTimeAt(cell.date);
            }

            self.events.push(event);

            event.roomId(self._id());

            socket.emit('event:update', ko.toJS(event), function(response){
                if(response.error){
                    //Undo
                    self.events.remove(event);
                    oldRoom.events.push(event);
                    event.roomId(oldRoom._id());
                    event.rootTimeAt(originalDate);
                }
            });
        };
    };

}).call(this);