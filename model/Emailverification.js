import mongoose , {Schema} from "mongoose";


const emailverificationSchema = new mongoose.Schema(
    {
        userId : String,
        token: String,
        created_At: Date,
        expires_At:Date 
    });


const EmailVerification = mongoose.model("Emailverification" , emailverificationSchema);

export default EmailVerification