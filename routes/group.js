const express=require('express');
const router=express.Router();
const {asyncWrap,isLoggedIn}=require("../helper");

const multer=require("multer");
const path = require("path");

const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

const Chat=require("../models/chats");
const User=require("../models/user");
const Group=require("../models/group");

router.route("/")
.get( isLoggedIn, asyncWrap(async (req,res,next)=>{
    let users= await User.find({});
    users=users.filter((u)=>{return u.id!==req.user.id});
    res.render("group/create.ejs",{users,user:req.user});
}))
.post(isLoggedIn, asyncWrap(async (req,res)=>{
    const { groupName, selectedUsers } = req.body;
    selectedUsers.push(req.user._id);
    // console.log(selectedUsers);

    try {
        // Create the group (adjust based on your database schema)
        const group = await Group.create({
            name: groupName,
            members: Array.isArray(selectedUsers) ? selectedUsers : [selectedUsers],
            admin: req.user._id,
        });
        // console.log(group)
        res.redirect(`/chats/${group.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating group');
    }
}))

// router.route("/:id")
// .get( isLoggedIn, asyncWrap(async (req,res,next)=>{
//     let {id}=req.params;
//     let toUser= await Group.findById(id).populate("members").populate("admin").populate("chats");//group details
//     let chats=toUser.chats;
//     res.render("chats.ejs",{toUser,user:req.user,chats});
// }))

module.exports= router;