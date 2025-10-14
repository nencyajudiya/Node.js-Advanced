import Blog from '../models/Blog.js';
import { validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
export const upload = multer({ storage });

const getUploadedImageUrl = (req) => {
    if (req.file) {
        return `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    return '';
};

export const createBlog = async (req, res) => {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { blog_title, blog_description, blog_status } = req.body;

    if (!blog_title || !blog_description) {
        return res.status(400).json({ message: "Title and description are required" });
    }

    const blog_image = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : "";

    const blog = new Blog({
        blog_title,
        blog_description,
        blog_status: blog_status || "draft",
        blog_image,
        author: req.user._id,
    });

    await blog.save();
    res.status(201).json(blog);
};




export const updateBlog = async (req, res) => {
    try {

        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { blog_title, blog_description, blog_status } = req.body;

        if (blog_title !== undefined) blog.blog_title = blog_title;
        if (blog_description !== undefined) blog.blog_description = blog_description;
        if (blog_status !== undefined) blog.blog_status = blog_status;

        if (req.file) {
            if (blog.blog_image && blog.blog_image.startsWith(`${req.protocol}://${req.get("host")}/uploads/`)) {
                const oldImagePath = blog.blog_image.replace(`${req.protocol}://${req.get("host")}/`, "");
                import("fs").then(fs => {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error("Old image delete failed:", err.message);
                    });
                });
            }

            blog.blog_image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        await blog.save();
        res.status(200).json(blog);
    } catch (err) {
        console.error("Update Blog Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this blog' });
        }

        if (blog.blog_image) {
            const imageUrl = blog.blog_image;
            const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            const imagePath = path.resolve('uploads', imageName);

            console.log("Trying to delete image:", imagePath);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log("Image deleted successfully");
            } else {
                console.log("Image not found on server");
            }
        }

        await blog.deleteOne();
        res.json({ message: 'Blog removed' });
    } catch (err) {
        console.error("Delete Blog Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name email');
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user._id })
            .populate('author', 'name email')
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
