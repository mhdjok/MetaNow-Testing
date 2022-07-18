import express from "express";
const app = express();
import * as http from "http";
const server = http.createServer(app);
import {Server} from "socket.io";
import {getByEmail, addUser, getUsers, userDisconnected, userConnected} from "./controllers/Users.js"
import {addChat, getChat, uploadImage, getGroupChat, uploadVoiceRecord} from "./controllers/Chats.js"
import Users from "./models/Users.js";
const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    cors: {
        origin: "*"
    }
});


var users = [];

io.on('connection', (socket) => {

    const socketId = socket.id;

    io.emit("users", users);

    socket.on("user" , async function (data) {
        let userSQLid = await addUser(data, socketId);
        data={...data,user_id:userSQLid}
        users.push(data);
        console.log(users);

        await userConnected(socketId);

        io.emit("users", users);
        io.to(data.id).emit('userId', data.user_id);
        console.log('User connected ' + socketId);

        let Dbusers = await getUsers();
        io.emit("dBusers", Dbusers);
    });

    socket.on("disconnect" , async function (){
        console.log('user disconnected ' + socketId);
        await userDisconnected(socketId);
        const indexOfObject = users.findIndex(object => {
            return object.id === socketId;
        });
        users.splice(indexOfObject, 1);
        console.log(indexOfObject);
        let Dbusers = await getUsers();
        io.emit("dBusers", Dbusers);

    });

    socket.on("message", async function (data) {
        console.log(data.type)
            if(data.type == 'TEXT') {
                let userSQLid = await addChat(data, 'TEXT', data.fullname);
            }
            else if(data.type == 'IMAGE') {
                data.message = data.message.split('.').join('-' + Date.now() + '-' + data.SenderSocketId + '.');
                let userSQLid = await addChat(data, 'IMAGE', data.fullname);
                await uploadImage(data.file, data.message);
            }
            else if(data.type == 'FILE'){
                data.message = data.message.split('.').join('-' + Date.now() + '-' + data.SenderSocketId + '.');
                let userSQLid = await addChat(data, 'FILE', data.fullname);
                await uploadImage(data.file, data.message);
            }
            else {
                data.message = data.message.split('.').join('-' + Date.now() + '-' + data.SenderSocketId + '.');
                let userSQLid = await addChat(data, 'VOICE', data.fullname);
                await uploadVoiceRecord(data.file, data.message);
            }
        if(data.group == false) {
            io.to(data.ReceiverSocketId).emit('message', data);
        }
        else {
            socket.broadcast.emit("message", data);
        }
    });

    socket.on("typing" , function (data){
        console.log(data)
        if(data.group != true) {
            io.to(data.ReceiverSocketId).emit('typing', data);
        }
        else {
            socket.broadcast.emit("typing", data);
        }
    });

    socket.on("finish-typing" , function (data){
        if(data.group != true) {
            io.to(data.ReceiverSocketId).emit('finish-typing', data);
        }
        else {
            socket.broadcast.emit("finish-typing", data);
        }
    });

    socket.on("getChat" , async function (data){
        let chat = await getChat(data);
        io.to(data.socket).emit('getChat', chat);

    });

    socket.on("getGroupChat" , async function (data){
        let chat = await getGroupChat();
        io.to(data.socket).emit('getGroupChat', chat);

    });

});


server.listen(3000, () => {
    console.log('listening on *:3000');
});
