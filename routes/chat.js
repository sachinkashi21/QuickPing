const express=require('express');
const router=express.Router();
const {asyncWrap,isLoggedIn}=require("../helper");

const multer=require("multer");
const path = require("path");

const {storage}=require("../cloudConfig.js");
const upload=multer({storage});



const Chat=require("../models/chats");
const User=require("../models/user");
let Group=require("../models/group");

router.route("/:id")
.get( isLoggedIn, asyncWrap(async (req,res,next)=>{
    let {id}=req.params;
    let toUser=await User.findById(id);
    if(toUser==null){
        toUser=await Group.findOne({_id:id}).populate("members").populate("admin").populate("chats");
        let chats=await Chat.find({groupTo:id}).populate("from");
        //console.log(toUser);
        return res.render("chats.ejs",{chats,toUser,user:req.user});
    }
    let chats= await Chat.find( {$and:[ {$or:[ {to:id}, {from:id} ]}, {$or:[ {to:res.locals.currUser.id}, {from:res.locals.currUser.id} ]} ]} ).populate("to").populate("from");
    res.render("chats.ejs",{chats,toUser,user:req.user});
}))

.post(isLoggedIn, upload.single('image'), asyncWrap(async (req,res,next)=>{
    let {id}=req.params;
    let {Msg}=req.body;

    let toUser=await User.findById(id);
    let newChat;
    if(!toUser){
        newChat={content:Msg, groupTo:id, from:req.user._id, date: new Date(), image: req.file?{url: req.file.path, filename: req.file.filename}:null};
    } else{
       newChat={content:Msg, to:id, from:req.user._id, date: new Date(), image: req.file?{url: req.file.path, filename: req.file.filename}:null};
    }
    let response=await Chat.insertMany([newChat]);
    //console.log(response);
    res.send(response);
}))

.put(isLoggedIn,asyncWrap(async (req,res)=>{
    let {id}=req.params;
    let {content:cnt}=req.body;
    Chat.findByIdAndUpdate(id,{content: cnt},{runValidators:true, new:true})
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    })
    res.redirect("/chats");
}))

module.exports=router;