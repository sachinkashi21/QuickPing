const mongoose=require("mongoose");
const {Schema}=mongoose;
const passportLocalMongoose=require("passport-local-mongoose");

let userSchema=new Schema({
    bio:{
        type: String,
        default: "Hey there! I am using ChatIt",
    },
    avatar:{
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    email:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);