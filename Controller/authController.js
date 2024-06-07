import Users from "../model/userModel.js";
import { CompareString, hashString , creteJWT } from "../utils/index.js";
import { sendverificationEmail } from "../utils/SendEmail.js";


  export  const register = async(req , res, next) =>{
    console.log(req.body);
    const {firstName , lastName , email , password} = req.body
        console.log(firstName);
    if(!(firstName || lastName || email || password)){
        next("Provide require fields")
        return
    }
    try {

    const UserExit = await Users.findOne({email})

    if(UserExit){
        next("Email address Already Exits")
         return
     }
     const hashPassword = await hashString(password)

     const user = await Users.create(
        {
            firstName , 
            lastName,
            email,
            password: hashPassword
        }
     )

     sendverificationEmail(user , res)
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message : error.message})
        
    }
       
    
}

export const Login = async(req , res, next) =>{
    const{email , password} = req.body;
     try {
        if(!email || !password){
            next(" email and password credential")
            return
        }
    
        const user =await Users.findOne({email}).select("+password").populate({
            path : "friends",
            select : "lastName  fristName loaction  profileUrl  password"
        })
        console.log(user , "+user");
    
        if(!user){
            next("invalid email and password ")
            return
        }
    
        if(!user?.verified){
            next("User is not verified . check your email account and verify the account")
            return
        }
    
        const IsmMatch = await CompareString(password , user?.password) 

        if(!IsmMatch){
            next("invalid email or password")
            return
        }
        user.password = undefined ; 
        const token =  await creteJWT(user?._id)
            console.log(token , "token");
        res.status(201).json({
            success: true,
            message : "Login Succesfully",
            user,
            token :token
        })
     } catch (error) {
        console.log(error);
        res.status(404).json({message:error.message})
     }
   
}