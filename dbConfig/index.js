import mongoose from "mongoose";


const dbConnection = async () =>{

try {
     const Connection  =  await mongoose.connect(process.env.MONGODB_URL , 
        { useNewUrlParser : true,
        useUnifiedTopology : true
        });
        console.log("MOngoDB is Successfully  connected");
} catch (error) {
    console.log("Connection disabled" , error);
}

}

export default dbConnection