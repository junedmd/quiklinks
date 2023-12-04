import express  from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
import Links from "./models/links.js ";
import path from "path";


const app = express();
app.use(express.json());
const __dirname = path.resolve();  

const PORT =process.env.PORT || 5000;

const connectDB = async()=>{
    const conn = await mongoose.connect(process.env.MONGO_URI);

    if(conn){
        console.log(`mongoDB is connected`)
    }
}
connectDB();

app.post("/link",async(req,res)=>{
        const {url ,slug}=req.body;

     const randomSlug = Math.random().toString(36).substring(2,7);

        const link =new Links({
            url:url,
            slug:slug || randomSlug

        })

        try{
            const savedLink = await link.save();

            return res.json({
                success:true,
                data:{
                    shortUrl:`${process.env.BASE_URL}/${savedLink.slug}`
                },
                message:"link saved successfully"
            })
        }
        catch(err){
          return res.json({
                success:false,
                message:err.message
            })
        }

})

app.get("/:slug", async(req,res)=>{
        const {slug}=req.params;

        const link = await Links.findOne({slug:slug});

        if(!link){
            return res.json({
                success:false,
                message:"link is not found"
            })
        }
        await Links.updateOne({slug:slug}, {$set:{
            clicks: link.clicks + 1
        }})

       res.redirect(Links.url);

});

app.get("/api/links" ,async (req,res)=>{
    const links = await Links.find({});

    return res.json({
        success:true,
        data:links,
        message:"links fetched successfully"
    })

})
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'))
      });
 
}

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
})