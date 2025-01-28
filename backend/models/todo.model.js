import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    description:{
        type: String,
        required: true
    },
    completed:{
        type: Boolean,
        required: true,
        default: false
    },
    assigned:{
        type: Boolean,
        required: true,
        default: false
    },
    important:{
        type: Boolean,
        required: true,
        default: false
    },
    due:{
        type: Date,
        required: false,
    },
    message:{
        type: String,
        required: false // message is unnecessary if not assigned
                        // if assigned, message is optional
    }
}, {timestamps: true});

const Todo = mongoose.model('Todo', todoSchema);
export default Todo