// import sequelize
import { Sequelize } from "sequelize";
// import connection
import db from "../config/database.js";
import Users from "./Users.js";

// init DataTypes
const { DataTypes } = Sequelize;

// Define schema
const Friends = db.define('friends', {
    // Define attributes
    user1: {
        type: DataTypes.STRING
    },
    user2: {
        type: DataTypes.STRING
    },
},{
    // Freeze Table Name
    underscored: true,
    freezeTableName: true
});

Friends.belongsTo(Users, {
    foreignKey: 'user1',
    as : 'firstUser'
});

Friends.belongsTo(Users, {
    foreignKey: 'user2',
    as : 'secondUser'
});
// Export model Product
export default Friends;
