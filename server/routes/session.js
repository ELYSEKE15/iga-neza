const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middleware/auth");
const Subject = require("../models/Subject");
const Session = require("../models/Session");
const router = express.Router();

router.post('/',requireAuth,async(req,res)=>{
    try{
       const{subjectId,minutes,note}=req.body;
       const valid = mongoose.isValidObjectId(subjectId);
       if(!valid){
           return res.status(400).json({error:"invalid subject id"})
        }
        if(!Number.isInteger(minutes) || minutes < 1 || minutes >600){
            return res.status(400).json({error:"invalid minutes"})
        }
        if( note !== undefined && typeof note !== "string"){
            return res.status(400).json({error:"invalid note"})
        }
        const verify = await Subject.findOne({_id :subjectId,owner:req.userId});
        if(!verify){
            return res.status(404).json({error:"subject not found"})
        }
        const session = await Session.create({
            owner :req.userId, subject :subjectId ,note, minutes
        });
        return res.status(201).json(session);

    }
    catch(error){
        console.error(error.message);
        return res.status(500).json({error: "something went wrong"});
    }
})
router.get('/',requireAuth,async(req,res)=>{
    try{
        const sessions = await Session.find({owner:req.userId})
        .sort({date:-1})
        .limit(100)
        res.json(sessions);

    }
    catch(error){
        console.error(error.message);
        res.status(500).json({error:"something went wrong"});
    }
});





module.exports = router;