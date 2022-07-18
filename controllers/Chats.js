// Import Product Model
import Chats from "../models/Chats.js";
import fs from "fs";
import formidable from "formidable";
import {Sequelize} from "sequelize";
import { Op } from 'sequelize';
export async function addChat(data, type, fullname = null){
        let chat = await Chats.create({
            "from_user": data.SenderId,
            "to_user": data.ReceiverUserId,
            "msg" : data.message,
            "type" : type,
            "fullname" : fullname
        });
        return JSON.stringify(chat.id);

}
export async function uploadImage(image, filaName){

    const splitted = image.split(';base64,');
    const format = splitted[0].split('/')[1];
    fs.writeFileSync('./images/'+filaName, splitted[1], { encoding: 'base64' });
}



export async function uploadVoiceRecord(record, filaName){

    fs.writeFileSync('./records/'+filaName, record );
}
export async function getChat(data){
    return await Chats.findAll({
        where : {
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
}

export async function getGroupChat(){
    return await Chats.findAll({
        where : {
                    to_user: '0'
        },
        order: [
            ['created_at', 'ASC'],
        ]
    });
}

// Get product by id
export const getChats = async (req, res) => {
    try {
        const product = await Product.findAll({
            where: {
                id: req.params.id
            }
        });
        res.send(product[0]);
    } catch (err) {
        console.log(err);
    }
}

// Create a new product
export const createProduct = async (req, res) => {
    try {
        await Product.create(req.body);
        res.json({
            "message": "Product Created"
        });
    } catch (err) {
        console.log(err);
    }
}

// Update product by id
export const updateProduct = async (req, res) => {
    try {
        await Product.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Product Updated"
        });
    } catch (err) {
        console.log(err);
    }
}

// Delete product by id
export const deleteProduct = async (req, res) => {
    try {
        await Product.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Product Deleted"
        });
    } catch (err) {
        console.log(err);
    }
}