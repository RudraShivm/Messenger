import express from "express";
import { SignIn, SignUp , GetAllUsers, GetSingleUser, GoogleSignIn} from "../controller/user.js";
const router = express.Router();

router.post('/signup', SignUp);
router.post('/signin',  SignIn);
router.post('/googleSignin', GoogleSignIn);
router.get('/allUsers', GetAllUsers);
router.get('/:userId', GetSingleUser);
export default router;