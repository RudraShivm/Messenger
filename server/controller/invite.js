import InviteModel from "../models/invite.js"

export const getInvite = async (req, res) => {
    const {inviteId} = req.params;
    try{
        const existingInvite = await InviteModel.findOne({_id : inviteId}).populate({
            path: "user",
            select : "name about profile_picture",
        });
        if(!existingInvite) return res.status(404).json({message : "invite not found"});
        if(existingInvite.expiryTime < Date.now()) return res.status(400).json({message : "invite token has expired"}); 
        res.status(200).json(existingInvite);
    }catch(error){
        res.status(500).json({message : "Something went wrong"});
    }
}


export const createInvite = async (req, res) => {
    const {data, access_token} = req.body;
    //15 mins validity
    const validityTime = 1000*60*15;
    let newInvite;
    try {
        if(data.inviteType == "individual"){
            newInvite = await InviteModel.create({user : data.userId, inviteType : data.inviteType, expiryTime : Date.now() + validityTime});
        }else if(data.inviteType == "group"){
            newInvite = await InviteModel.create({user : data.userId, chat : data.chatId, inviteType : data.inviteType, expiryTime : Date.now() + validityTime});
        }
        if( newInvite ) return res.status(201).json({newInvite, token : access_token});
    } catch (error) {
        res.status(500).json({message : "Something went wrong"});
    }
}

