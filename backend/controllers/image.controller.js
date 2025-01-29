import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';

export const uploadImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('coverImg');
        if(!user) return res.status(404).json({ message: 'User not found' });
        const image = req.body.image;
        if(!image) return res.status(400).json({ message: 'Image cannot be empty' });
        cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
        const status = await cloudinary.uploader.upload(image);
        user.coverImg = status.secure_url;
        await user.save();
        res.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.log(error);
    }
}

export const getImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('coverImg');
        if(!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ image: user.coverImg });
    } catch (error) {
        console.log(error);
        
    }
}