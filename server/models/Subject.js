const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        name : {type:String,required:true,trim:true,maxlenght:50},
        weeklyGoalHours : {type:Number,required:true,minlength:1,maxlength:40},
        owner : {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
    },
    {timestamps:true}
);

module.exports = mongoose.model("Subject",subjectSchema);