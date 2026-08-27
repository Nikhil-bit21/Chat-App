const express = require('express');
const http = require('http');
const path = require('path');
const {Server} = require('socket.io');

const app = express();

app.use(express.static(path.resolve('./public')));

const server = http.createServer(app); 
const io = new Server(server);

const PORT = 3000;

//Socket Connection (socket is basically client)
io.on('connection',(socket)=>{
    socket.on('user-msg',message=>{
        io.emit('msg',message);
    })
})

app.get('/',(req,res)=>{
    return res.sendFile('/public/index.html');
})

server.listen(PORT,()=>{
    console.log(`Server started at Port ${PORT}`);
})