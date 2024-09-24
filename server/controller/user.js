import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import user from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import dotenv from "dotenv/config";
import { performance } from "perf_hooks";
import BlacklistedTokenModel from "../models/blacklistedToken.js";

async function fetchUserData(access_token) {
  const userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
  try {
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error);
    console.error("Error fetching user data:", error);
  }
}

export const GoogleSignIn = async (req, res) => {
  const { code } = req.body;
  try {
    const start = performance.now();

    // console.log("Starting token exchange...");
    const tokenStart = performance.now();
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.CLIENTID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: `${process.env.CLIENT_BASE_URL}`,
      grant_type: "authorization_code",
    });
    const tokenEnd = performance.now();
    // console.log(`Token exchange took ${tokenEnd - tokenStart} ms`);

    const { access_token, refresh_token } = data;

    // console.log("Starting user data fetch...");
    const userFetchStart = performance.now();
    const userData = await fetchUserData(access_token);
    const userFetchEnd = performance.now();
    // console.log(`User data fetch took ${userFetchEnd - userFetchStart} ms`);

    // console.log("Starting database operation...");
    const dbStart = performance.now();
    let existingUser = await user
      .findOneAndUpdate(
        { email: userData.email },
        { $set: { refresh_token: userData.refresh_token } },
        { new: true }
      )
      .exec();

    const dbEnd = performance.now();
    // console.log(`Database operation took ${dbEnd - dbStart} ms`);

    if (existingUser) {
      if (existingUser.signUpMethod == "local")
        return res
          .status(400)
          .json({ message: "email is already signed up with another account" });

      let { refresh_token: _, ...existingUser_wo_refresh_token } =
        existingUser._doc;

      res
        .status(200)
        .json({ user: existingUser_wo_refresh_token, token: access_token });
    } else {
      const newUser = await user.create({
        _id: userData.sub,
        name: userData.name,
        about: `I am ${userData.name}`,
        profile_picture: userData.picture,
        email: userData.email,
        refresh_token,
        signUpMethod: "google",
      });
      let { refresh_token: _, ...newUser_wo_refresh_token } = newUser._doc;
      res
        .status(201)
        .json({ user: newUser_wo_refresh_token, token: access_token });
    }

    const end = performance.now();
    // console.log(`Total operation took ${end - start} ms`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const SignUp = async (req, res) => {
  const { name, about, profile_picture, email, password, confirmPassword } =
    req.body;
  try {
    const existingUser = await user.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    if (password != confirmPassword)
      return res.status(400).json({ message: "Password don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    let _id = uuidv4();

    const newUser = await user.create({
      _id,
      name,
      about,
      profile_picture,
      email,
      password: hashedPassword,
      signUpMethod: "local",
    });
    const refresh_token = jwt.sign(
      { email: newUser.email, _id: newUser._id },
      process.env.PRIVATE_KEY,
      {
        expiresIn: "30d",
        algorithm: "RS256",
      }
    );

    newUser.refresh_token = refresh_token;
    newUser.markModified("refresh_token");
    await newUser.save();

    const access_token = jwt.sign(
      { email: newUser.email, _id: newUser._id },
      process.env.PRIVATE_KEY,
      {
        expiresIn: "1d",
        algorithm: "RS256",
      }
    );
    res.status(201).json({ user: newUser, token: access_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const SignIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    let existingUser = await user
      .findOne({ email })
      .exec();

    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    const refresh_token = jwt.sign(
      { email: existingUser.email, _id: existingUser._id },
      process.env.PRIVATE_KEY,
      { expiresIn: "30d", algorithm: "RS256" }
    );

    existingUser.refresh_token = refresh_token;
    existingUser.markModified("refresh_token");
    await existingUser.save();

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    const access_token = jwt.sign(
      { email: existingUser.email, _id: existingUser._id },
      process.env.PRIVATE_KEY,
      { expiresIn: "1d", algorithm: "RS256" }
    );

    res.status(202).json({ user: existingUser, token: access_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const SignOut = async (req, res) => {
  const { userId, access_token } = req.body;
  try {
    const existingUser = await user
      .findOne({ _id: userId })
      .select("refresh_token");
    if (access_token) {
      if (!(await BlacklistedTokenModel.findOne({ token: access_token }))) {
        const newAccessToken = await BlacklistedTokenModel.create({
          token: access_token,
        });
        await newAccessToken.save();
      }
    }
    if (
      !(await BlacklistedTokenModel.findOne({
        token: existingUser.refresh_token,
      }))
    ) {
      const newRefreshToken = await BlacklistedTokenModel.create({
        token: existingUser.refresh_token,
      });
      await newRefreshToken.save();
    }
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const GetAllUsers = async (req, res) => {
  try {
    const users = await user.find().select("_id name profile_picture");
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const GetSingleUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const existingUser = await user
      .findOne({ _id: userId })
      .select("name profile_picture")
      .exec();
    res.status(200).json({ existingUser, hello:"hello" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const GetPopulatedUserArr = async (req, res) => {
  const { userArr } = req.body;
  try {
    const result_userArr = [];
    for (let usrId of userArr) {
      const existingUser = await user.findOne({ _id: usrId }).exec();
      if (existingUser) {
        result_userArr.push({
          _id: existingUser._id,
          name: existingUser.name,
          profile_picture: existingUser.profile_picture,
        });
      }
    }
    res.status(200).json({ result_userArr });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
