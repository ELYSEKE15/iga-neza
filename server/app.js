require("dotenv").config();
const express =require( 'express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const  path = require('path');
const PORT = 3000;

const app =express();

app.use(helmet());
app.use(express.json({limit:"10kb"}));
app.use("/api/auth",require("./routes/auth"));
app.use("/api/subjects",require("./routes/subjects"));
app.use("/api/sessions",require("./routes/session"));
app.use(express.static(path.join(__dirname,"..","public")));
app.use("/api/progress", require("./routes/progress"));

app.get("/api/notes" , (req,res) =>{
    res.json({status:"ok"});
});

mongoose
.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("connection successful");
    app.listen(PORT , () =>{
        console.log("server is running");
    });

})
.catch((err) =>{
    console.error("connection faild",err.message);
    process.exit(1);
});