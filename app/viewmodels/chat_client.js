
(function(){
    "use strict";

    this.room_planner = this.room_planner || {};

    var socket = room_planner.getSocket();

    room_planner.ChatClient = function(conventionId){
        var self = this;

        self.name = ko.observable();
        self.alias = ko.observable();
        self.chatLog = ko.observableArray().extend({ scrollFollow: '.chat-entries' });
        self.text = ko.observable();

        self.focusText = ko.observable();

        self.collapsed = ko.observable(false);
        self.newMessage = ko.observable(false);
        self.flashState = ko.observable(false);

        var addMessage = function(msg, alias){
            self.chatLog.push({ message: msg, alias: alias});
        }

        self.sendMessage = function(){
            var message = self.text();

            if(message){
                socket.emit('chat:message', {
                    message: message,
                    convention: conventionId
                });
                addMessage(message, "Me");
                self.text("");
            }
        };

        self.setAlias = function(){
            var name = self.name();

            if(name){
                self.alias(name);
                socket.emit('chat:setAlias', name);
                self.focusText(true);
            }
        };

        self.checkSubmitMessage = function(model, event){
            if (event.keyCode === 13) {
                setTimeout(self.sendMessage, 0);//lazy hack
                self.focusText(true);
            }
            return true;
        };

        self.checkSubmitName = function(model, event){
            if (event.keyCode === 13) {
                setTimeout(self.setAlias,0); //lazy hack
            }
            return true;
        };

        self.clearAlias = function(model, event){
            self.name(self.alias());
            self.alias('');
        };

        socket.on('chat:message', function(data) {
             addMessage(data['message'], data['pseudo']);
        });

        socket.on('client:name', function(data) {
            self.alias(data);
            addMessage("* Now known as " + data + ". *", "");
        });
    };

}).call(this);