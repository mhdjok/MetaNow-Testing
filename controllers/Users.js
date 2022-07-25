// Import Product Model
import Users from "../models/Users.js";
import fs from "fs";
import {Op} from "sequelize";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import * as util from "util";
const jwtVerifyAsync = util.promisify(jwt.verify);
const jwtKey = "jllgshllWEUJHGHYJkjsfjds90"
const jwtExpirySeconds = 86400
export async function getByEmail(email){
    try {

        const users = await Users.findAll({
            where: {
                email: email
            }
        });
        return !!users.length;

    } catch (err) {
        console.log(err);
    }
}

export async function getUserByEmail(email){
    try {

        const users = await Users.findOne({
            where: {
                email: email
            }
        });
        return users;

    } catch (err) {
        console.log(err);
    }
}

export async function getUserByUserId(userId){
    try {

        const users = await Users.findOne({
            where: {
                id: userId
            }
        });
        return users;

    } catch (err) {
        console.log(err);
    }
}

export async function checkToken(token, userId){
    try {
        let checkToken = await jwtVerifyAsync(token, jwtKey)
        return checkToken.user_id == userId;
    } catch (err) {
        console.log(err);
    }
}

export async function changeProfilePicture(image, userId, imageName) {
    try {
        await Users.update({profile_image: "profilePictures/" + imageName}, {
            where: {
                id: userId
            }
        });
        const splitted = image.split(';base64,');
        const format = splitted[0].split('/')[1];
        fs.writeFileSync('./profilePictures/' + imageName, splitted[1], {encoding: 'base64'});
    } catch (err) {
        console.log(err);
    }
}

export async function addUser(data, socketId) {
    try {
        if ((await getByEmail(data.email)) === false && data.email.trim() != "") {
            let user = await Users.create({
                "fullname": data.fullname,
                "email": data.email,
                "socket_id": socketId,
                "last_seen": "Online",
                "profile_image": "profilePictures/main.png"
            });
            return JSON.stringify(user.id);
        } else {
            await Users.update({socket_id: socketId}, {
                where: {
                    email: data.email
                }
            });
            let user = await getUserByEmail(data.email)
            return user.id;
        }
    } catch (err) {
        console.log(err);
    }
}

export async function userDisconnected(socketId) {
    try {
        let date_ob = new Date().toISOString();
        await Users.update({last_seen: date_ob}, {
            where: {
                socket_id: socketId
            }
        });
    } catch (err) {
        console.log(err);
    }
}

export async function userConnected(socketId) {
    try {
        await Users.update({last_seen: "Online"}, {
            where: {
                socket_id: socketId
            }
        });
    } catch (err) {
        console.log(err);
    }
}

export async function getUsers() {
    try {
        return await Users.findAll(
            {
                order: [
                    ['last_seen', 'DESC'],
                ]
            }
        );
    } catch (err) {
        console.log(err);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;


        const user = await Users.findOne({
            where: {
                email : req.body.email
            }
        });

        if (user && (await bcrypt.compare(req.body.password, user.password))) {
            // Create token
            const token = jwt.sign({ user_id: user.id, email : user.email, full_name : user.fullname }, jwtKey, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            })
            let user2={...user.dataValues,token}
            res.status(200).json(user2);
        }else {
            res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.log(err);
    }
}

export const register = async (req, res) => {
    try {
        console.log('entered ' + JSON.stringify(req.body))
        const { fullName, email, password } = req.body;
        const oldUser = await Users.findOne({
            where: {
                email : req.body.email
            }
        });

        console.log('oldUser '+ JSON.stringify(oldUser))
        if (oldUser) {
            return res.status(404).send("User Already Exist. Please Login");
        }

         let encryptedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await Users.create({
            fullname : req.body.fullName,
            email: req.body.email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            last_seen: "Online",
            profile_image: "profilePictures/main.png"

        });

        const token = jwt.sign({ user_id: user.id, email : req.body.email }, jwtKey, {
            algorithm: "HS256",
            expiresIn: jwtExpirySeconds,
        })



        let user2={...user.dataValues,token}
        console.log(user2)

        res.status(200).json(user2);
    } catch (err) {
        console.log(err);
    }
}

export const refreshToken = async (req, res) => {
    const token = req.body.token;
    try {
        let test5 = req.auth = await jwtVerifyAsync(token, jwtKey)
        res.status(200).json(test5);
    }catch (err) {
        res.status(401).json('Expired');
    }

}