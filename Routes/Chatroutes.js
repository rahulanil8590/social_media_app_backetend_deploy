import express from 'express'
import { CreareMessage, GetMessages, createChat, userChats } from '../Controller/ChatController.js'
const router = express.Router()


router.post('/' , createChat)
router.get('/:userId' , userChats)
// router.get('/existchat/:senderId/:recieverId', ExitChatCheck)
router.post('/sendMessage', CreareMessage)
router.get('/getMessage/:ChatId' , GetMessages)
export default router