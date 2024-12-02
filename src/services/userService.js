const User = require("../models/userModel");

const findUserByEmail = async (email) => {
    try {
        
    
  return await User.findOne({ email });} catch (error) {
        return null;
    }
};

const findUserById = async (id) => {
    try {
        
    
  return await User.findById(id);} catch (error) {
        return null;
    }
};

const createUser = async (userData) => {
    try {
        
    
  return await User.create(userData);} catch (error) {
        return null;
    }
};

const updateUserById = async (id, updateData) => {
    try {
        
    
  return await User.findOneAndUpdate({ _id: id }, updateData, { new: true });} catch (error) {
        return null;
    }
};

const findUserByIdWithExclusion = async (id, excludeFields) => {
    try {
        
    
  return await User.findById(id).select(excludeFields);} catch (error) {
        return null;
    }
};

const findStudents = async () => {
    try {
        
    
  return await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });} catch (error) {
        return null;
    }
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserById,
    findUserByIdWithExclusion,
    findStudents
}