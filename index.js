const express = require('express');
const http = require('http');
const path = require('path');
const {Server} = require('socket.io');
const sqlite3 = require('sqlite3');
const {open} = require('sqlite');

const app = express();

let db;

async function dbConnection(){
    db = await open({
        filename:'chat.db',
        driver:sqlite3.Database
    })

    await db.exec(`Create Table IF Not Exists messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content text
        )`)
}

app.use(express.static(path.resolve('./public')));

const server = http.createServer(app); 
const io = new Server(server,{
    connectionStateRecovery:{}
});

const PORT = 3000;

//Socket Connection (socket is basically client)
io.on('connection',async (socket)=>{
    socket.on('user-msg',async (message)=>{
        //io.emit('msg',message); // sends/emits message to everyone including itself
        // socket.broadcast.emit('msg',message); // for sending/emitting message to everyone except itself
        let res;
        try{
            res = await db.run('INSERT INTO messages (content) values (?)',message);
        }catch(e){
            return;
        }
        socket.broadcast.emit('msg',message,res.lastID);
    })
    if(!socket.recovered){
        try{
            await db.each('select id,content from messages where id>?',[socket.handshake.auth.serverOffset || 0],
                (_err , row)=>{
                    socket.emit('msg',row.content,row.id);
                }
            )
        }catch(e){

        }
    }
    // socket.on('disconnect',()=>{
    //     // console.log('user disconnected');
    // })
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

dbConnection().then(()=>{
    server.listen(PORT,()=>{
    console.log(`Server started at Port ${PORT}`);
})
});