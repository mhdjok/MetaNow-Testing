// import sequelize
import { Sequelize } from "sequelize";
// import connection
import db from "../config/database.js";

// init DataTypes
const { DataTypes } = Sequelize;

// Define schema
const Chats = db.define('chat', {
    // Define attributes
    from_user: {
        type: DataTypes.STRING
    },
    to_user: {
        type: DataTypes.STRING
    },
    msg: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.STRING
    },
    fullname: {
        type: DataTypes.STRING
    },
},{
    // Freeze Table Name
    underscored: true,
    freezeTableName: true
});

// Export model Product
export default Chats;
