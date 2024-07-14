import mongoose from "mongoose";

const ChatSchema = mongoose.Schema ({
    messages : [{
        sender : {
            type : String,
            ref : 'UserModel',
        },
        message: String,
        time : {
            type : Date,
            default : Date.now,
        },
    }],
});

const ChatModel = mongoose.model('ChatModel', ChatSchema); 
export default ChatModel; 