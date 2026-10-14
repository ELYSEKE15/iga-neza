const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        minutes : {type : Number ,required : true, min:1,max:600 },
        note : {type : String, maxlength:200,trim:true},
        date : {type:Date, default:Date.now},
        owner :{
            type : mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        subject : {
            type :mongoose.Schema.Types.ObjectId,
            ref:"Subject",
            required: true
        },
    },
    {timestamps:true}
);

module.exports = mongoose.model("Session",sessionSchema);