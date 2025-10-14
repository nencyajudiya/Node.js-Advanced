import mongoose from 'mongoose';


const blogSchema = new mongoose.Schema(
{
blog_title: { type: String, required: true, trim: true },
blog_image: { type: String, default: '' }, 
blog_description: { type: String, required: true },
blog_status: { type: String, enum: ['draft', 'published'], default: 'draft' },
author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},
{ timestamps: true }
);


export default mongoose.model('Blog', blogSchema);