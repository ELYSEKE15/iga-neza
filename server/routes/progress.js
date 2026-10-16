const express = require("express");
const requireAuth = require("../middleware/auth");
const Subject = require("../models/Subject");
const Session = require("../models/Session");

const router = express.Router();

router.get("/",requireAuth,async(req,res)=>{
    try{
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const subject = await Subject.find({owner : req.userId});
        const sessions = await Session.find({
            owner : req.userId,
            date : {$gte : weekAgo},
        });
        const minutesBySubject ={};
        for (const s of sessions){
            const id = String(s.subject);
             minutesBySubject[id] = (minutesBySubject[id] || 0) + s.minutes;
        }
        const result = subject.map((sub)=>{
            const studiedMinutes = minutesBySubject[String(sub._id)] || 0;
            const goalMinutes = sub.weeklyGoalHours * 60;
            const percent  = Math.min(100,Math.round((studiedMinutes / goalMinutes) *100));
            return{
                subjectId : sub._id,
                name : sub.name,
                goalHours: sub.weeklyGoalHours,
                studiedMinutes,
                percent,
            };

        });
        res.json(result);
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({error:"something went wrong"});
    }
});

module.exports = router;