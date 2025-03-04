import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    todo:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo'
    }],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Group = mongoose.model('Group', groupSchema); 
export default Group