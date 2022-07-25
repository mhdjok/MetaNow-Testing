// Import Product Model
import Chats from "../models/Chats.js";
import fs from "fs";
import { Op } from 'sequelize';
import {addFriends, checkIfFriends} from "./Friends.js"
import Friends from "../models/Friends.js";
import Users from "../models/Users.js";
let added = false;
export async function addChat(data, type, fullname = null) {
    try {
        if(await checkIfFriends(data.SenderId, data.ReceiverUserId) == null){
            await addFriends(data.SenderId, data.ReceiverUserId)
            added = true;
        }
        let chat = await Chats.create({
            "from_user": data.SenderId,
            "to_user": data.ReceiverUserId,
            "msg": data.message,
            "type": type,
            "fullname": fullname
        });

        return added;

    } catch (err) {
        console.log(err);
    }
}

export async function uploadImage(image, filaName) {
    try {
        const splitted = image.split(';base64,');
        const format = splitted[0].split('/')[1];
        fs.writeFileSync('./images/' + filaName, splitted[1], {encoding: 'base64'});
    } catch (err) {
        console.log(err);
    }
}

export async function uploadFile(image, filaName) {
    try {
        const splitted = image.split(';base64,');
        const format = splitted[0].split('/')[1];
        fs.writeFileSync('./files/' + filaName, splitted[1], {encoding: 'base64'});
    } catch (err) {
        console.log(err);
    }
}

export async function uploadVoiceRecord(record, filaName) {
    try {
        fs.writeFileSync('./records/' + filaName, record);
    } catch (err) {
        console.log(err);
    }
}

export async function getChat(data) {
    try {
        return await Chats.findAll({
            where: {
                [Op.or]: [
                    {
                        from_user: data.userId,
                        to_user: data.toUserId
                    },
                    {
                        from_user: data.toUserId,
                        to_user: data.userId
                    }
                ]
            },
            order: [
                ['created_at', 'ASC'],
            ]
        });
    } catch (err) {
        console.log(err);
    }
}

export async function getGroupChat() {
    try {
        return await Chats.findAll({
            where: {
                to_user: '0'
            },
            order: [
                ['created_at', 'ASC'],
            ]
        });
    } catch (err) {
        console.log(err);
    }
}

export async function makeMsgsSeen(sender, receiver){
    try {
        await Chats.update({seen: 1}, {
            where: {
                from_user: sender,
                to_user: receiver,
                seen : 0
            }
    });

}
        catch (err) {
            console.log(err);
        }
}

export async function deleteChat(UserId, ToUserId) {
    try {
        await Friends.destroy({
            where: {
                [Op.or]: [
                    {
                        user1: UserId,
                        user2: ToUserId
                    },
                    {
                        user1: ToUserId,
                        user2: UserId
                    }
                ]
            },
        })
        return await Chats.destroy({
            where: {
                [Op.or]: [
                    {
                        from_user: UserId,
                        to_user: ToUserId
                    },
                    {
                        from_user: ToUserId,
                        to_user: UserId
                    }
                ]
            },
        });
    } catch (err) {
        console.log(err);
    }
}