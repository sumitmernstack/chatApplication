const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(8000).sockets;


mongo.connect('mongodb://127.0.0.1/chatapplication', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    // Con to socket
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        sendStatus = function(s){
            socket.emit('status', s);
        }

        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // sending the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            // Checking the name and message
            if(name == '' || message == ''){
                sendStatus('Please enter a name and message');
            }
            else
                {
                    chat.insert({name: name, message: message}, function(){
                        client.emit('output', [data]);

                        // Send status object
                        sendStatus({
                            message: 'Message sent',
                            clear: true
                        });
                    });
                }
        });

     // Removing all chats 
        socket.on('clear', function(data){
            chat.remove({}, function(){
                socket.emit('cleared');
            });
        });
    });
});