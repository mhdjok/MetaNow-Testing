import express from "express";
const app = express();
import * as http from "http";
const server = http.createServer(app);
import {Server} from "socket.io";
import {
    getByEmail,
    addUser,
    getUsers,
    userDisconnected,
    userConnected,
    getUserByUserId,
    changeProfilePicture,
    checkToken,
} from "./controllers/Users.js"
import {addChat, getChat, uploadImage, getGroupChat, uploadVoiceRecord, uploadFile, deleteChat, makeMsgsSeen} from "./controllers/Chats.js"
import {addFriends, checkFriends} from "./controllers/Friends.js"
import friends from "./models/Friends.js";
import routes from "./routes/routes.js";
import cors from 'cors';

app.use(cors())
app.use(routes)


const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    cors: {
        origin: "*"
    }
});


var users = [];

io.on('connection', (socket) => {

    const socketId = socket.id;

    socket.on("user" , async function (data) {
        let userSQLid = await addUser(data, socketId);
        data={...data,user_id:userSQLid}
        users.push(data);

        await userConnected(socketId);

        io.emit("users", users);
        io.to(data.id).emit('userId', data.user_id);

        let Dbusers = await getUsers();
        io.emit("dBusers", Dbusers);

        let Friends = await checkFriends(data.user_id)
        io.to(data.id).emit('friends', Friends);

        if(data.token != null) {
            let check = await checkToken(data.token, data.user_id);
            io.to(data.id).emit('checkToken', check);
        }

    });

    socket.on('friends', async function(data){
        let Friends = await checkFriends(data)
        let socketId = await getUserByUserId(data);
        io.to(socketId.socket_id).emit('friends', Friends);
    })

    socket.on("disconnect" , async function (){
        await userDisconnected(socketId);
        let Dbusers = await getUsers();
        io.emit("dBusers", Dbusers);

    });

    socket.on("getUser", async function(data){
        let user = await getUserByUserId(data.userId);
        let MySocket = await getUserByUserId(data.myId);
        io.to(MySocket.socket_id).emit('getUser', user);
    });

    socket.on("message", async function (data) {
        let userSQLid = false;
        if(data.type == 'TEXT') {
             userSQLid = await addChat(data, 'TEXT', data.fullname);
        }
        else if(data.type == 'IMAGE') {
            data.message = data.message.split('.').join('-' + Date.now() + '-' + data.fullname + '.');
             userSQLid = await addChat(data, 'IMAGE', data.fullname);
            await uploadImage(data.file, data.message);
        }
        else if(data.type == 'FILE'){
            data.message = data.message.split('.').join('-' + Date.now() + '-' + data.fullname + '.');
             userSQLid = await addChat(data, 'FILE', data.fullname);
            await uploadFile(data.file, data.message);
        }
        else {
            data.message = data.message.split('.').join('-' + Date.now() + '-' + data.fullname + '.');
             userSQLid = await addChat(data, 'VOICE', data.fullname);
            await uploadVoiceRecord(data.file, data.message);
        }
        if(data.group == false) {
            let receiverSocket = await getUserByUserId(data.ReceiverUserId)
            let senderSocket = await getUserByUserId(data.SenderId)
            if(userSQLid){
                let senderFriends = await checkFriends(data.SenderId)
                let receiverFriends = await checkFriends(data.ReceiverUserId)
                io.to(receiverSocket.socket_id).emit('friends', receiverFriends);
                io.to(senderSocket.socket_id).emit('friends', senderFriends);
            }
            io.to(receiverSocket.socket_id).emit('message', data);

        }
        else {
            socket.broadcast.emit("message", data);
        }
    });

    socket.on("typing" , async function (data){
        if(data.group != true) {
            let receiverSocket = await getUserByUserId(data.ReceiverId)
            io.to(receiverSocket.socket_id).emit('typing', data);
        }
        else {
            socket.broadcast.emit("typing", data);
        }
    });

    socket.on("finish-typing" ,  async function (data){
        if(data.group != true) {
            let receiverSocket = await getUserByUserId(data.ReceiverId)
            io.to(receiverSocket.socket_id).emit('finish-typing', data);
        }
        else {
            socket.broadcast.emit("finish-typing", data);
        }
    });

    socket.on("getChat" , async function (data){
        let chat = await getChat(data);
        let userSocket = await getUserByUserId(data.userId)
        await makeMsgsSeen(data.toUserId, data.userId);
        io.to(userSocket.socket_id).emit('getChat', chat);

    });

    socket.on("seenMsgs" , async function (data){
        await makeMsgsSeen(data.toUserId, data.userId);
        let receiverSocketId = await getUserByUserId(data.toUserId);
        io.to(receiverSocketId.socket_id).emit('seenMsgs', data.userId);
    });

    socket.on("getGroupChat" , async function (data){
        let chat = await getGroupChat();
        let userSocket = await getUserByUserId(data.userId)
        io.to(userSocket.socket_id).emit('getGroupChat', chat);

    });

    socket.on("changeProfile" , async function (data){
        data.imageName = data.imageName.split('.').join('-' + Date.now() + '-' + data.userId + '.');
        await changeProfilePicture(data.image, data.userId, data.imageName);
        let Dbusers = await getUsers();
        io.emit("dBusers", Dbusers);
    });

    socket.on("deleteChat", async function(data){
        await deleteChat(data.myUserId, data.toUserId);
        let Dbusers = await getUsers();
        io.emit("dBusers", Dbusers);
    })
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});
