const mongoose=require("mongoose");
const {Schema}=mongoose;

const chatSchema= new mongoose.Schema({
    isGroup:{
        type:Boolean,
        default:false
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    to: {
        type:Schema.Types.ObjectId,
        ref: "User"
    },
    groupTo:{
        type:Schema.Types.ObjectId,
        ref: "Group"
    },
    content: {
        type: String,
        maxLen: 30,
    },
    image: {
        url: {
            type: String,
            default: "",
        },
        filename: {
            type: String,
            default: null,
        },
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

const Chat= mongoose.model("Chat",chatSchema);

module.exports = Chat;