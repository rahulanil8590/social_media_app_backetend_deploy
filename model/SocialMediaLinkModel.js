import mongoose , {Schema} from "mongoose";



const SocialLinkSchema = new mongoose.Schema(
    {
        userId : {type : String , ref : 'User'},
        instagram :{
            type : String
        },
        twitter :{
            type : String
        },
        facebook : {
            type : String
        },

        token: String,
    },
    {timestamps : true}
    );


const SocialLinkModel = mongoose.model("socialmedialink" ,  SocialLinkSchema);

export default SocialLinkModel