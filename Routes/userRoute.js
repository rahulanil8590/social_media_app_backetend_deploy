import express from 'express';
import path from 'path';
import verifyEmail,
 {  AcceptRequest,
    ChangePassword, 
    CreateSocialLink, 
    GetFriendsRequest, 
    ProfileSec, 
    Suggestion, 
    friendsRequest, 
    getSocialMediaLink, 
    getUser, 
    requestPasswordReset, 
    resetPassword,
     updateUser } from '../Controller/UserController.js';
import userAuth from '../Middleware/authMiddleware.js';


const router = express.Router();
const _dirname = path.resolve(path.dirname(""))
//EmailVerificatio
router.get('/verify/:userId/:token' , verifyEmail)
//Password Reset
router.post('/request-passwordreset' , requestPasswordReset)
router.get('/reset-password/:userId/:token', resetPassword)
router.post('/reset-password',ChangePassword)
//Get user route
router.post('/get-user/:id?', userAuth , getUser)
router.put("/update-user", userAuth, updateUser);
//friends request 
router.post('/friend-request', userAuth, friendsRequest)
router.post('/get-friend-request', userAuth, GetFriendsRequest);
//accept / deny friend request
router.post("/accept-request",userAuth , AcceptRequest)
//Profile view
router.post('/profile-view' , userAuth , ProfileSec)
//Suggested Friends
router.post('/suggested-friend', userAuth, Suggestion);
//Social media  Links
router.post('/socialmediaLink' ,userAuth, CreateSocialLink )
router.get('/socialmediaLink/:userId' ,userAuth, getSocialMediaLink )
router.get("/verified/" ,(req, res) =>{
    res.sendFile(path.join(_dirname , "./views/build" , "index.html"));
})
router.get("/resetpassword" ,(req, res) =>{  
    res.sendFile(path.join(_dirname , "./views/build" , "index.html"))
})

export default router