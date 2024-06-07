import mongoose , {Schema} from "mongoose";


const MessageScheme= new mongoose.Schema(
    {
      ChatId : {
        type : String
      },
      senderId : {
        type : String
      },
      text : {
        type : String
      }
       
    }, {timestamps : true});


const MessageModel = mongoose.model("MessageModel" , MessageScheme);

export default MessageModel