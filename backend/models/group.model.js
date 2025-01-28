import mongoose from "mongoose";
import { todo } from "node:test";

const groupSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    todo:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo'
    }]
});

const Group = mongoose.model('Group', groupSchema); 
export default Group