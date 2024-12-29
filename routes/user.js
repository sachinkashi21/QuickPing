const express=require('express');

const router=express.Router();
const {asyncWrap,isLoggedIn}=require("../helper");

const multer=require("multer");
const path = require("path");

const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

const Group=require("../models/group");
const Chat=require("../models/chats");
const User=require("../models/user");

const passport=require("passport");
const user = require('../models/user');

router.route("/signUp")
.get((req,res)=>{
    res.render("signUp.ejs",{user:req.user});
})
.post(async(req,res,next)=>{
    let {username,email,password}=req.body;

    let user=new User({
        username,email
    });
    let regisUser=await User.register(user,password);

    res.redirect("/login");
})

router.route("/login")
.get((req,res)=>{
    res.render("login.ejs",{user:req.user});
})
.post(passport.authenticate("local",{
    failureRedirect:"/login",
    }), 
    (req,res)=>{
    res.redirect("/users");
})

router.route("/logout")
.get((req,res)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/login");
    })
})

router.route("/users")
.get(isLoggedIn,asyncWrap(async (req,res)=>{
    let allUsers=await User.find({});
    let allGroups = await Group.find({ members: req.user.id });
    allUsers=allUsers.filter((user)=>{return !(user.id===res.locals.currUser.id)});
    res.render("users.ejs",{user:req.user, allUsers, allGroups});
}))

router.route("/settings")
.get(isLoggedIn,(req,res)=>{
    res.render("settings.ejs",{user:req.user});
})

router.post("/updateBio",async(req,res)=>{
    let {bio}=req.body;
    let id=req.user.id;
    console.log(bio,id);
    let user=await User.findById(id);
    console.log(user);
    let response=await User.findByIdAndUpdate(id,{bio:bio});
    // console.log(response)
    res.redirect("/settings");
})
router.post("/updateAvatar",upload.single("avatar"),async(req,res)=>{
    let id=req.user.id;
    let avatar=req.file.path;
    if(avatar){
        let response=await User.findByIdAndUpdate(id,{avatar:avatar});
    }
    res.redirect("/settings");
})
router.get("/dashboard/:id",async(req,res)=>{
    let id=req.params.id;
    let toUser=await User.findById(id);
    if(!toUser){
        toUser=await Group.findById(id).populate("admin").populate("members");
    }
    res.render("profile.ejs",{user:req.user,profile:toUser});
})

module.exports= router;