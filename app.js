require('dotenv').config();

const express=require("express");
const app=express();
const port=8080;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path=require("path");
app.set("views",path.join(__dirname,"/views"));

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:false}));

const engine=require("ejs-mate");
app.engine("ejs",engine);

const methodOverride=require("method-override");
app.use(methodOverride('_method'));

const chatsRouter=require("./routes/chat.js");
const usersRouter=require("./routes/user.js");
const groupsRouter=require("./routes/group.js");



let dbUrl=process.env.ATLAS_URL;

// if(process.env.NODE_ENV==="dev"){
//     dbUrl="mongodb://127.0.0.1:27017/chatdb";
// }
const mongoose=require("mongoose");
main()
.then((res)=>{
    console.log("connection established");
}) 
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

const Chat=require("./models/chats.js");
const User=require("./models/user.js");

const session=require("express-session");
const MongoStore=require("connect-mongo");

let store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:60*60*3,
})

store.on("error",(err)=>{
    console.log("Error in mongo session",err)
})

let sessionOptions={      
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now()+ 1000*60*60,
        maxAge: 1000*60*60,
        httpOnly: true,
    }
}
app.use(session(sessionOptions));



const passport=require("passport");
const LocalStrategy=require("passport-local");

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.currUser= req.user;
    next();
});

app.use("/",usersRouter);
app.use("/chats",chatsRouter);
app.use("/group",groupsRouter);


app.get("/",(req,res)=>{
   res.render("home.ejs",{user:req.user});
});


const server=app.listen(port,()=>{
    console.log("server running "+port);
});

// let socketConnected=new Set();
const io= require('socket.io')(server);
let roomMembers={};
io.on('connection',onConnected);

function onConnected(socket){
    // console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        roomMembers[roomId] = roomMembers[roomId] || new Set();
        roomMembers[roomId].add(socket.id);
    
        io.to(roomId).emit("client-total", roomMembers[roomId].size);
    });

    socket.on("message",({ roomId, Msg, uploadedImageUrl })=>{
        socket.broadcast.to(roomId).emit("chat-message", { Msg, uploadedImageUrl });
    })

    socket.on("disconnect",()=>{
        // console.log("Socket diconnected", socket.id);
        for (const roomId in roomMembers) {
            if (roomMembers[roomId].has(socket.id)) {
                roomMembers[roomId].delete(socket.id);
                io.to(roomId).emit("client-total", roomMembers[roomId].size);
            }
        }
    })

    
}

