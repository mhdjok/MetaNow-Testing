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

    socket.on("groupMessage", async function (data) {
        if(data.group == false) {
            let userSQLid = await addChat(data, 'TEXT');
            console.log('msg added id ' + userSQLid)
            io.to(data.socketId).emit('groupMessage', data);
        }
        else {
            let userSQLid = await addChat(data, 'TEXT',data.fullname);
            socket.broadcast.emit("groupMessage", data);
        }
    });

        socket.on("typing" , function (data){
            console.log(data)
            if(data.group != true) {
                io.to(data.socket).emit('typing', data);
            }
            else {
                socket.broadcast.emit("typing", data);
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


    socket.on("finish-typing" , function (data){
        if(data.group != true) {
            io.to(data.socket).emit('finish-typing', data);
        }
        else {
            socket.broadcast.emit("finish-typing", data);
        }
    });


    socket.on("base64 file", async function (msg) {

        let userSQLid = await addChat(msg, 'IMAGE', msg.fullname);
        console.log(msg)
        await uploadImage(msg.file, msg.message);
        if(msg.group == false)
            socket.to(msg.id).emit('base64 image', msg);

        else {
            socket.broadcast.emit("base64 image", msg);
        }
    });

    socket.on("attachFile", async function (msg) {
        console.log(msg)
        let userSQLid = await addChat(msg, 'FILE', msg.fullname);
        await uploadImage(msg.file, msg.message);
        if(msg.group == false)
            socket.to(msg.id).emit('attachFile', msg);

        else {
            socket.broadcast.emit("attachFile", msg);
        }
    });

    socket.on("voiceRecord", async function (msg) {

        console.log(msg)
        let userSQLid = await addChat(msg, 'VOICE', msg.fullname);
        await uploadVoiceRecord(msg.file, msg.message);
        if(msg.group == false)
            socket.to(msg.id).emit('voiceRecord', msg);

        else {
            socket.broadcast.emit("voiceRecord", msg);
        }
    });
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});
