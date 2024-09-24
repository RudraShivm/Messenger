import Localbase from "localbase";
import Cookies from "js-cookie";

export async function addProfile(user, token) {
  let db = new Localbase("db");
  const friendsMap = user.friends.reduce((acc, item) => {
    acc.set(item._id, item);
    return acc;
  }, new Map()); 
  user.friends = friendsMap;

  // Cookies usage checkList : HttpOnly, SameSite: Strict or Lax , Short-lived Tokens, Validate Tokens
  Cookies.set("token", token, {
    secure: true,
    sameSite: "strict",
    expires: 7,
  });
   // if an account is inactive for 7 or more days, user has to authenticate again
  await db.collection("messenger").add({
    id: 1,
    profile: { user },
  });
  return user;
}

export async function deleteProfile() {
  let db = new Localbase("db");
  await db.collection("messenger").doc({ id: 1 }).delete();
}

export async function getProfile() {
  let db = new Localbase("db");
  let serialObj = null;
  await db
    .collection("messenger")
    .doc({ id: 1 })
    .get()
    .then((doc) => {
      if(doc){
        serialObj = doc.profile;
      }
    });
    console.log("after getProfile" );
    console.log(serialObj);
  return serialObj;
}

export async function updateProfile(serialObj) {
  let db = new Localbase("db");
  await db.collection("messenger").doc({ id: 1 }).update({
    profile: serialObj,
  });
}
export async function updateProfileChats(serialObj, currProfile) {
  let db = new Localbase("db");
  await db.collection("messenger").doc({ id: 1 }).update({
    profile: {...currProfile, user : {...currProfile.user, chats: serialObj.user.chats} },
  });
}
export async function updateProfileFriends(serialObj, currProfile) {
  let db = new Localbase("db");
  await db.collection("messenger").doc({ id: 1 }).update({
    profile: {...currProfile, user : {...currProfile.user, friends: serialObj.user.friends} },
  });
}
