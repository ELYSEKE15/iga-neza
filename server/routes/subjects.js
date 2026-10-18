const express = require("express");
const Subject = require("../models/Subject");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.post('/',requireAuth,async(req,res)=>{
    try{
        const {name,weeklyGoalHours} =req.body;
        if(!name || typeof name !== "string" ){
            return res.status(400).json({error:"invalid name"})
        }
        const checkHours = Number.isInteger(weeklyGoalHours);
        if(!checkHours ){
            return res.status(400).json({error:"invalid hours"})
        }
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(401).json({error:"Not authorized"})
                }
        const newSubject = await Subject.create({
            name,weeklyGoalHours,owner:req.userId
        })
        return res.status(201).json(newSubject);
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({error:"something went wrong"})
    }
});

router.get('/',requireAuth,async(req,res)=>{
    try{
        const subjects = (await Subject.find({owner : req.userId})).sort({createdAt:-1});
        res.json(subjects);
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({error:"something went wrong"})
    }
})
module.exports=router;