import bcrypt from 'bcryptjs'
import  JWT from 'jsonwebtoken'


 export const hashString = async( useValue) =>{
    const salt  = await bcrypt.genSalt(10)
    console.log(salt , "salt");

    const hashPassword = await bcrypt.hash(useValue , salt)
    return hashPassword
}

export const CompareString = async(userPassword , password) =>{
    const isMatch  = bcrypt.compare(userPassword , password)
    return isMatch
}

export const creteJWT =async (id) =>{
        return JWT.sign({userId : id }, process.env.JWT_SECRET_KEY ,{
            expiresIn: "1d"
        })
}

