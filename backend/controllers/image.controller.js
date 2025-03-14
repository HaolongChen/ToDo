import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';

export const uploadImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('coverImg');
        if(!user) return res.status(404).json({ message: 'User not found' });
        
        const image = req.body.image;
        if(!image) return res.status(400).json({ message: 'Image cannot be empty' });
        
        // Delete old image if exists
        if(user.coverImg) {
            const publicId = user.coverImg.split('/').pop().split('.')[0];
            if(publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.log('Error deleting old image:', err);
                }
            }
        }
        
        // Add data URI prefix to the base64 string
        const dataUri = `data:image/jpeg;base64,${image}`;
        const status = await cloudinary.uploader.upload(dataUri);
        
        user.coverImg = status.secure_url;
        await user.save();
        res.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error uploading image' });
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