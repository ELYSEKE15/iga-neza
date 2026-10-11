const express= require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

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
    const cleanEmail = await User.findOne({
        email:email.toLowerCase().trim()
    });
    const exists = await User.findOne({email:cleanEmail}) 
    if(exists){
        return res.status(409).json({
            error:"Email already registered"
        });
    }
    const hash = await bcrypt.hash(password,10);
    const user = await User.create({
        name, cleanEmail ,password:hash
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

router.post("/login",async(req,res)=>{
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
        return res.status(200).json({
            user: {id:user._id,name:user.name,email:user.email}
        })
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({
            error:"something went wrong "
        })
    }
});

module.exports = router;