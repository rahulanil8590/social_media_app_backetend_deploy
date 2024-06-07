import express from 'express'
import authRoute from './authRoute.js'
import userRoutes from './userRoute.js'
import PostRoute from './PostRoute.js'
import Chatroutes from './Chatroutes.js'
 const route =  express.Router()


 route.use('/auth'  , authRoute)
route.use('/users' , userRoutes);
route.use('/posts', PostRoute);
route.use('/chat' , Chatroutes);
 export default route