const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const MONGODB_url = "mongodb://127.0.0.1:27017/wanderlust";



async function main(){
    await mongoose.connect (MONGODB_url);
}

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
      ...obj,
      owner: "699c2068e7628c2337e62ef4",
      geometry: obj.geometry || { type: 'Point', coordinates: [0, 0] }
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized") 
}

main().then(async () => {
    console.log("Successful connection");
    try {
        await initDB();
    } catch (err) {
        console.error("initDB failed:", err);
    }
}).catch((err)=>{
    console.log("something show error", err);
});