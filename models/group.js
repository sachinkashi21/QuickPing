let mongoose=require("mongoose");
let {Schema}=mongoose;

let groupSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "Available",
    },
    avatar:{
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0KTVtaFUpkbxvLs38DH5MhhEnnYlrFfkBkg&s",
    },
    admin:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    chats: [
        {
            type: Schema.Types.ObjectId,
            ref: "Chat",
        }
    ]
})

module.exports=mongoose.model("Group",groupSchema);

