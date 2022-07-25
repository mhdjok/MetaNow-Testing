// Import Product Model
import Friends from "../models/Friends.js";
import { Op } from 'sequelize';
import Users from "../models/Users.js";

export async function addFriends(user1, user2){
    try {
        let frnds = await Friends.create({
            "user1": user1,
            "user2": user2,
        });
        return JSON.stringify(frnds.id);
    }
    catch (err) {
        console.log(err);
    }
}

export async function checkFriends(user1) {
    try {
        let frnds = await Friends.findAll({
            where: {
                [Op.or]: [
                    {
                        user1: user1,
                    },
                    {
                        user2: user1,
                    }
                ]
            },
            include:[ {
                model: Users,
                as: 'firstUser'
            },
                {
                    model: Users,
                    as: 'secondUser'
                }
            ]

        });
        return frnds;
    }
    catch (err) {
        console.log(err);
    }
}


export async function checkIfFriends(user1, user2) {
    try {
        let frnds = await Friends.findOne({
            where: {
                [Op.or]: [
                    {
                        user1: user1,
                        user2: user2,
                    },
                    {
                        user2: user1,
                        user1: user2,
                    }
                ]
            },
        });
        return frnds;
    }
    catch (err) {
        console.log(err);
    }
}