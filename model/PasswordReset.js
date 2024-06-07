import mongoose , {Schema} from "mongoose";


const PasswordSchema = new mongoose.Schema(
    {
        userId : {type : String , unique : true},
        email : {type : String , unique : true},
        token: String,
        created_At: Date,
        expires_At:Date 
    });


const Resetpassword = mongoose.model("Resetpassword" ,  PasswordSchema);

export default Resetpassword