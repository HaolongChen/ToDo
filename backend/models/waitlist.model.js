import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema({
    isRequest:{
        type: Boolean,
        required: true
    },
    toUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fromUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isProcessed:{
        type: Boolean,
        required: true,
        default: false
    },
    todo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo'
    }, // todo to be assigned
    message:{
        type: String,
        required: false
    },
    isOfficial:{
        type: Boolean,
        required: true,
        default: false
    }
})

const Waitlist = mongoose.model('Waitlist', waitlistSchema); 
export default Waitlist