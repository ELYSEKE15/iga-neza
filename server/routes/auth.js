const express= require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const loginLimit = rateLimit({
    windowMs : 15 * 60 * 1000,
    max: 10,
    message:{error:"you try many times contact us for help"}
})



router.post("/register" ,async (req,res)=>{
    try{
    const {name,email,password}=req.body;
    if( typeof name !=="string" || typeof email !== "string" || typeof password!== "string"){
        return res.status(400).json({error:"invalid input"});

    }
    if(!name.trim() || !email.includes("@") || password.length < 8){
        return res.status(400).json({
            error:"Name , a valid email and password of 8 characters are required"
        });
    }
    const cleanEmail = email.toLowerCase().trim();
    const exists = await User.findOne({email:cleanEmail}) 
    if(exists){
        return res.status(409).json({
            error:"Email already registered"
        });
    }
    const hash = await bcrypt.hash(password,10);
    const user = await User.create({
        name, email:cleanEmail ,password:hash
    });
    res.status(201).json({
        user : {id:user._id,name:user.name,email:user.email}
    });

}
catch(err){
    console.error(err.message);
    res.status(500).json({
        error:"something went wrong"
    })
}
});

router.post("/login",loginLimit,async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(typeof email !== "string" || typeof password !== "string"){
            return res.status(400).json({error:"Invalid input"});
        }
        const user = await User.findOne({
            email:email.toLowerCase().trim()
        });
        if(!user){
            return res.status(401).json({error:"invalid email or password"}) 
        }
        const ismatch = await bcrypt.compare(password,user.password);
        if(!ismatch){
            return res.status(401).json({error:"Invalid email or password"})
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn : "7d"} );
        return res.status(200).json({token,user:{id:user._id,name:user.name,email:user.email}});
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({
            error:"something went wrong "
        })
    }
});

module.exports = router;