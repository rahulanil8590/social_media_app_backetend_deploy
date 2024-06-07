import mongoose, { Schema } from "mongoose";


const UserSchema = new mongoose.Schema({
    firstName: {
        type : String,
        required : [true, 'First name is Required']
    },
    lastName:  {
        type : String,
        required : [true, 'Last Name is Required']
    },
    email: {
        type : String,
        required : [true, 'email is Required'],
        unique : true
    },
    password :{
        type : String,
        required : [true, 'Password is Required'],
        minlength : [6, "password lenght should be greater than 6 character"],
        select: true
    },
        location:{type : String},
        profileUrl :{type : String},
        profession: {type : String},
        friends:[{type: Schema.Types.ObjectId , ref: 'Users'}],
        views:[{type : String}],
        verified: {type : Boolean , default : false},     
},
  {timestamps : true}
)

const Users = mongoose.model("Users", UserSchema);

export default Users