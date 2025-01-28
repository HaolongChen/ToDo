import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema({
    group:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const Waitlist = mongoose.model('Waitlist', waitlistSchema); 
export default Waitlist