import mongoose , {Schema} from "mongoose";


const ChatScheme= new mongoose.Schema(
    {
       members : {
        type : Array
       }, 
       
    }, {timestamps : true});


const ChatModel = mongoose.model("ChatModel" , ChatScheme);

export default ChatModel