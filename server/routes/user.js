import express from "express";
import {
  SignIn,
  SignUp,
  GetAllUsers,
  GetSingleUser,
  GoogleSignIn,
  SignOut,
  GetPopulatedUserArr,
} from "../controller/user.js";
const router = express.Router();

router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.post("/googleSignin", GoogleSignIn);
router.post("/signout", SignOut);
router.get("/allUsers", GetAllUsers);
router.post("/getPopulatedUserArr", GetPopulatedUserArr);
router.get("/:userId", GetSingleUser);
export default router;
