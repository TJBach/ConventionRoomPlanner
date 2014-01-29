var _ = require('underscore');

var routes = function(app){
    var package = {};

    package.chatRoutes = {
        setAlias: function(req) {
            var name = req.data;

            var oldName = app.io.get('pseudo') || 'New user';
            var viewedCons = app.io.get('conventions') || [];

            if(name && name !== oldName){
                app.io.set('pseudo', name);

                for(var i = 0; i < viewedCons.length; i++){
                    req.io.room(viewedCons[i]).broadcast('chat:message', {
                        message: '* ' + oldName + ' is now known as ' + name + '. *',
                        pseudo : ''
                    });
                }

                //update other windows you may have open.
                req.io.emit('client:name', name);
            }

            console.log(oldName + " set alias to " + name);
        },
        message: function(req) {
            var message = req.data.message;
            var convention = req.data.convention;

            var name = app.io.get('pseudo');

            if(name && convention && message){
                var data = { 'message' : message, pseudo : name };

                req.io.room(convention).broadcast('chat:message', data);

                console.log("user " + name + " said to " + convention + " : " + message);
            }
        }
    };

    package.conventionRoutes = {
        connect: function(req){
            var conventionId = req.data;

            req.io.join(conventionId);

            var name = app.io.get('pseudo');
            var display = name || "New user";

            req.io.room(conventionId).broadcast('chat:message', {
                message: '* ' + display + ' has connected. *',
                pseudo : ''
            });

            if(name){
                req.io.emit('client:name', name);
            }

            //track cons we are watching.
            var cons =_.union((app.io.get('conventions') || []), [conventionId]);
            app.io.set('conventions', cons);

            console.log("user " + name + " joined " + conventionId);
        }
    };

    return package;
};

module.exports = routes;

