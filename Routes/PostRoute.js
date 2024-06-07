import express from 'express'
import userAuth from '../Middleware/authMiddleware.js'
import { GetUserpost, commentPost, createPosts, deletePost, getComments, getPost, getPosts, likePost, likePostComment, replyPostComment } from '../Controller/PostController.js'

const router = express.Router()
//create post
router.post("/create-post" , userAuth , createPosts )
//get posts
router.post("/" , userAuth , getPosts );
router.post("/:id" , userAuth , getPost );
router.post("/get-user-post/:id", userAuth , GetUserpost);
//  get comments
router.get("/comment/:postId", userAuth , getComments);
router.post("/like-post/:id", userAuth , likePost)
router.post("/like-comment/:id/:rid?", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);

//delete post
router.delete("/:id", userAuth, deletePost);
export default router;