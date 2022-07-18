// Import Product Model
import Users from "../models/Users.js";

// Get all products
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

export async function addUser(data, socketId){
    if((await getByEmail(data.email)) === false)
    {
        let user = await Users.create({
            "fullname": data.fullname,
            "email": data.email,
            "socket_id" : socketId,
            "last_seen" : "Online",
            "profile_image" : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        });
        return JSON.stringify(user.id);
    }else{
        await Users.update( {socket_id : socketId}, {
            where: {
                email: data.email
            }
        });
        let user = await getUserByEmail(data.email)
        return user.id;
    }
}
export async function userDisconnected(socketId){
    let date_ob = new Date().toISOString();
    // let hours = date_ob.getHours();
    // let minutes = ('0'+date_ob.getMinutes()).slice(-2);
    // let minutes = date_ob.getMinutes();

    await Users.update( {last_seen : date_ob}, {
        where: {
            socket_id: socketId
        }
    });
}

export async function userConnected(socketId){
    await Users.update( {last_seen : "Online"}, {
        where: {
            socket_id: socketId
        }
    });
}


// Get product by id
export async function getUsers() {
        const users = await Users.findAll(
            {
                order: [
                    ['last_seen', 'DESC'],
                ]
            }
        );
        return users;
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