import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minLength: 6
    },
    team:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    coverImg:{
        type: String,
        required: false,
        default: ''
    },
    email:{
        type: String,
        required: false,
        default: ''
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User