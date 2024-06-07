import mongoose, { Mongoose } from "mongoose";
import postModel from "../model/postModel.js"
import Users from "../model/userModel.js";
import commentModel from "../model/commentsModel.js"


export const createPosts = async (req, res,next) =>{
    try {
        const {userId} = req.body.user;
        const{description , image, video} = req.body;
         if(!description){
            next("description is required")
            return
         }

         const post = await postModel.create({
            userId,
            description,
            image,
            video
         })

         res.status(201).json({
            success : true , 
            message : `Post create successfully ${Date.now()}`,
            data : post,
            
         })

    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}

export const getPosts = async(req ,res, next) =>{
    try {
        const {userId} = req.body.user;
        const {search} =req.body


        const user =  await Users.findById(userId)
        const friends =  user?.friends?.toString().split(",") ?? []
        console.log(friends , "friends");
        friends.push(userId)
        
        const searchPoatQuery ={
            $or : [
                {
                    description : {$regex : search ,  $options : "i"}
                },
            ],
        };
        const posts = await postModel.find(search ? searchPoatQuery : {})
        .populate({
            path : "userId",
            select : "firstName  lastName location profileUrl  -password"
        })
        .sort(
            {
                _id : -1
            }
        );
        const friendsPost =  posts?.filter((post) =>{
            return friends.includes(post?.userId?._id?.toString())
        })
        const otherPost =  posts?.filter((post) =>{
            return !friends.includes(post?.userId?._id?.toString())
        })

        let postRes = null

        if(friendsPost?.length > 0 ){
            postRes =  search ? friendsPost : [...friendsPost , ...otherPost]
        }else{
            postRes =posts
        }
         res.status(200).json({
            success : true , 
            message : ` successfully ${Date.now()}`,
            data : postRes,
            
         })

    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
}
export const getPost = async(req ,res, next) =>{
    try {
        const {id} =req.params

        const post = await postModel.findById(id)
        .populate({
            path : "userId",
            select : "firstName  lastName location profileUrl  -password"
        })
    // .populate({
    //   path: "comments",
    //   populate: {
    //     path: "userId",
    //     select: "firstName lastName location profileUrl -password",
    //   },
    //   options: {
    //     sort: "-_id",
    //   },
    // })
    // .populate({
    //   path: "comments",
    //   populate: {
    //     path: "replies.userId",
    //     select: "firstName lastName location profileUrl -password",
    //   },
    // });
         res.status(200).json({
            success : true , 
            message : ` successfully ${Date.now()}`,
            data : post,
            
         })

    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
}

export const GetUserpost = async(req ,res ,next) =>{
    try {
        const {id} =req.params
            console.log(id , "==grrt-user-post");
        const post = await postModel.find({userId : id })
        .populate({
            path : "userId",
            select : "firstName  lastName location profileUrl    -password"
        })
        .sort({ _id: -1 });
        res.status(200).json({
            success : true , 
            message : ` successfully ${Date.now()}`,
            data : post,
            
         })
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}


export const getComments = async(req ,res, next) =>{
    try {
        const {postId} =req.params

        const comments = await commentModel.find({postId})
        .populate({
            path : "userId",
            select : "firstName  lastName location profileUrl  -password"
        })
        .populate({
            path : "replies.userId",
            select : "firstName  lastName location profileUrl  -password"
        })
        .sort({ _id : -1 });
        res.status(200).json({
            success : true , 
            message : ` successfully ${Date.now()}`,
            data : comments,
            
         })
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}
export const likePost = async(req ,res, next) =>{
    try {
        const{userId} =req.body.user
        const {id} =req.params
        const post = await postModel.findById(id)
        const index = post.likes.findIndex((pid) => String(pid) === String(userId))
        console.log(index);
        if(index === -1){
            post.likes.push(userId)
        }else{
            post.likes = post.likes.filter((pid) =>
                pid !== String(userId)
                
            )
        }
         const newPost =  await postModel.findByIdAndUpdate( id , post ,{new : true})
       
        res.status(200).json({
            success : true , 
            message : ` successfully ${Date.now()}`,
            data : newPost,
            
         })
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}

export const likePostComment = async(req ,res, next) =>{
    try {
        const{userId} =req.body.user
        const {id , rid} =req.params
        if(rid === undefined || rid === null || rid === 'false'){
            const comment = await commentModel.findById(id)
            const index = comment.likes.findIndex((el) => el === String(userId));

            if (index === -1) {
              comment.likes.push(userId);
            } else {
              comment.likes = comment.likes.filter((i) => i !== String(userId));
            }
      
            const updated = await commentModel.findByIdAndUpdate(id, comment, {
              new: true,
            });
      
            res.status(201).json(updated);
        }else{
            const replyComments = await commentModel.findOne(
                { _id: id },
                {
                  replies: {
                    $elemMatch: {
                      _id: rid,
                    },
                  },
                }
              );
              const index = replyComments?.replies[0]?.likes.findIndex(
                (i) => i === String(userId)
              );
        
              if (index === -1) {
                replyComments.replies[0].likes.push(userId);
              } else {
                replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
                  (i) => i !== String(userId)
                );
              }
        
              const query = { _id: id, "replies._id": rid };
        
              const updated = {
                $set: {
                  "replies.$.likes": replyComments.replies[0].likes,
                },
              };
        
              const result = await commentModel.updateOne(query, updated, { new: true });
        
              res.status(201).json(result);
        }
       
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}

export const commentPost = async(req ,res, next) =>{
    try {
        const{userId} =req.body.user;
        const {id } =req.params;
        const{comment , from} = req.body;

        if(comment === null){
            return res.status(404).json({ message: "Comment is required." });
        }

        const newComment = new commentModel({comments : comment , from ,userId, postId: id })
        await newComment.save();

        //updating the post with the comments id
        const post = await postModel.findById(id);
    
        post.comments.push(newComment._id);
    
        const updatedPost = await postModel.findByIdAndUpdate(id, post, {
          new: true,
        });
    
        res.status(201).json(newComment);
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}

export const replyPostComment = async(req ,res, next) =>{
    try {
        const{userId} =req.body.user
        const {id } =req.params
        const { comment, replyAt, from } = req.body;
        if (comment === null) {
            return res.status(404).json({ message: "Comment is required." });
          }
        
         
            const commentInfo = await commentModel.findById(id);
        
            commentInfo.replies.push({
              comment,
              replyAt,
              from,
              userId,
              created_At: Date.now(),
            });
        
            commentInfo.save();
        
            res.status(200).json(commentInfo);
       
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}

export const deletePost = async(req ,res, next) =>{
    try {
        const { id } = req.params;

        await postModel.findByIdAndDelete(id);
    
        res.status(200).json({
          success: true,
          message: "Deleted successfully",
        });
       
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
}