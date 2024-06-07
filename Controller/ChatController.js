import ChatModel from "../model/ChatModel.js"
import MessageModel from "../model/MessageModel.js"

export const createChat = async (req, res , next) =>{
    const{senderId ,recieverId} = req.body
    try {     
    const ExitChat  = await ChatModel.findOne({
        members: { $all: [senderId, recieverId] }
    });
    console.log(ExitChat ,"user exit in the chat");
    if(ExitChat){
        res.status(200).json( ExitChat )
    }else{
        const newData = new ChatModel({
            members :  [ senderId , recieverId]
           })
           const result = await newData.save()
           res.status(200).json(result)
    }
}
 catch (error) {
    res.status(500).json(error)
   }
}

export const  CreareMessage = async(req, res, next) =>{
    try {
        const {ChatId, senderId , text} = req.body
        const NewMessage = new MessageModel({
            ChatId,
            senderId, 
            text
        })

        const result =  await NewMessage.save()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const GetMessages = async(req, res, next) =>{
    try {
        const{ ChatId} = req.params
        const Message =  await MessageModel.find({ChatId : ChatId})
        console.log(Message , "=====Messages");
        res.status(200).json(Message)
    } catch (error) {
        res.status(500).json(error)
    }
}
export const userChats = async (req, res) => {
    try {
      const chat = await ChatModel.find({
        members: { $in: [req.params.userId] },
      });
      console.log(chat , "user Chat ");
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).json(error);
    }
  };