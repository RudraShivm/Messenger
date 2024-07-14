import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import user from '../models/user.js'; 
import {v4 as uuidv4} from 'uuid';
export const GoogleSignIn = async (req, res) =>{
    const {_id, name, profile_picture, email, token} = req.body;
    console.log(_id);
    try {
        const existingUser = 
        await user
        .findOne({email})
        .populate('chats.user', 'name profile_picture') 
        .exec();
        console.log(existingUser);
        if(existingUser) {
            console.log("a");
            if(existingUser.signUpMethod == 'local') return res.status(400).json({message : "email is already signed up with another account" });
            res.status(200).json({user:existingUser, token});
        }else{
            console.log("v");
            const newUser = await user.create({ _id , name, about : `I am ${name}`, profile_picture, email, signUpMethod : 'google'});
            console.log(newUser);
            res.status(201).json({user: newUser, token});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Something went wrong"});
    }
}
export const SignUp = async (req, res) => {
    const { name, about, profile_picture, email, password, confirmPassword } = req.body;
    try{
        const existingUser = 
        await user
        .findOne({email});
        if(existingUser) return res.status(400).json({message:"User already exists"});
        if(password!=confirmPassword) return res.status(400).json({message:"Password don't match"})
        const hashedPassword = await bcrypt.hash(password, 12);

        let _id = uuidv4();
        const newUser = await user.create({_id, name, about, profile_picture, email, password: hashedPassword, signUpMethod:'local'});
        
        const token = jwt.sign({ email: newUser.email, _id: newUser._id}, 'test', {expiresIn: '1h'});
        res.status(201).json({user: newUser, token});
    }catch(error){
        res.status(500).json({message: "Something went wrong"});
    }
}

export const SignIn = async (req, res)=>{
    const {email, password} = req.body;
    try{   
        const existingUser = 
        await user
        .findOne({email})
        .populate('chats.user', 'name profile_picture') 
        .exec();

        if(!existingUser) return res.status(404).json({message:"User not found"});
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credinals"});
        const token = jwt.sign({email:existingUser.email, _id:existingUser._id}, 'test', {expiresIn:'1h'});
        res.status(202).json({user:existingUser, token});
    }catch(error){
        res.status(500).json({message:"Something went wrong"});
    }
        
}

export const GetAllUsers = async (req, res)=>{
    try{
        const users = 
        await user
        .find()
        .select('_id name profile_picture');
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message:"Something went wrong"});
    }
}

export const GetSingleUser = async (req, res) =>{
    const {userId} = req.params;
    try{
        const existingUser = 
        await user
        .findOne({_id : userId})
        .select('name profile_picture')
        .exec();
        res.status(200).json({existingUser});
    }catch(error){
        res.status(500).json({message:"Something went wrong"});
    }
}