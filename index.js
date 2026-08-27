const express = require('express');
const http = require('http');
const path = require('path');
const {Server} = require('socket.io');

const app = express();

app.use(express.static(path.resolve('./public')));

const server = http.createServer(app); 
const io = new Server(server,{
    connectionStateRecovery:{}
});

const PORT = 3000;

//Socket Connection (socket is basically client)
io.on('connection',(socket)=>{
    socket.on('user-msg',message=>{
        //io.emit('msg',message); // sends/emits message to everyone including itself
        socket.broadcast.emit('msg',message); // for sending/emitting message to everyone except itself
    })
    socket.on('disconnect',()=>{
        // console.log('user disconnected');
    })
    // socket.timeout(5000).emit('wait-message',{name:'Nikhil'},(err,res)=>{
    //     if(err){
    //         console.log('Client did not responded ')
    //     }else{
    //         console.log(res.status);
    //     }
    // })
})

app.get('/',(req,res)=>{
    return res.sendFile('/public/index.html');
})

server.listen(PORT,()=>{
    console.log(`Server started at Port ${PORT}`);
})