import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    _id : {type: String, required: true},
    name : {type: String, required: true},
    about : String,
    profile_picture : String,
    email : {type:String, required:true},
    password : {type:String},
    signUpMethod : {type:String},
    chats : [{
        user : {type: String, ref: 'UserModel'},
        chat : {type: mongoose.Schema.Types.ObjectId, ref: 'ChatModel'},
        lastMessageInfo : {
            message : {type: String, default: "You can now chat with each other"},
            time : {type: Date, default: Date.now},
        },
    }],
    friends : [{
        user : {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'},
    }]
});

//middleware
UserSchema.pre('save', function(next) {
    this.chats.sort((a, b) => {
        let timeA = new Date(a.lastMessageInfo.time).getTime();
        let timeB = new Date(b.lastMessageInfo.time).getTime();

        return timeA - timeB;
    });

    next();
});


const UserModel = mongoose.model('UserModel', UserSchema);
export default UserModel; 