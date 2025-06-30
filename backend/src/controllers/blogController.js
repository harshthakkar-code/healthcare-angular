const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');

exports.createBlog = async (req, res, next) => {
  try {
    let imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const blog = new Blog({
      ...req.body,
      author: req.user._id,
      image: imagePath
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) { next(err); }
};

exports.getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate('author', 'name');
    res.json(blogs);
  } catch (err) { next(err); }
};

exports.getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) { next(err); }
};

exports.updateBlog = async (req, res, next) => {
  try {
    let update = { ...req.body };
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) { next(err); }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    // Optionally delete image file
    if (blog.image) {
      const imgPath = path.join(__dirname, '../../', blog.image);
      fs.unlink(imgPath, err => {});
    }
    res.json({ message: 'Blog deleted' });
  } catch (err) { next(err); }
}; 