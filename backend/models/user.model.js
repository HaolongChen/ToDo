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
    pendingTeam:[{
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'User'
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        from:{
            type: Boolean,
            required: true
        }
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
    },
    bio:{
        type: String,
        required: false,
        default: ''
    },
    totalTasks:{
        type: Number,
        required: false,
        default: 0
    },
    completedTasks:{
        type: Number,
        required: false,
        default: 0
    },
    totalTeams:{
        type: Number,
        required: false,
        default: 0
    },
    
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User