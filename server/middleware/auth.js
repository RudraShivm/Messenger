import jwt from "jsonwebtoken";
import axios from "axios";
import user from "../models/user.js";
import fs from "fs";
import path from "path";
//thanks co-pilot, for once it helped finally
function isJwtToken(token) {
  // Check if token has three parts separated by dots
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(parts[1]));

    if (payload.email && payload._id) {
      return true;
    }

    // Check for Google's issuer
    if (
      payload.iss === "accounts.google.com" ||
      payload.iss === "https://accounts.google.com"
    ) {
      return false;
    }
  } catch (e) {
    console.error("Error decoding token", e);
    return false;
  }

  return false;
}

async function verifyToken(userId, accessToken) {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
    );

    const tokenInfo = response.data;
    const usrId = tokenInfo.sub; 
    return { usrId, accessToken };
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // If access_token is expired or invalid
      try {
        const existingUser = await user
          .findOne({ _id: userId })
          .select("refresh_token");

        const { data } = await axios.post(
          "https://oauth2.googleapis.com/token",
          {
            client_id: process.env.CLIENTID,
            client_secret: process.env.CLIENT_SECRET,
            refresh_token: existingUser.refresh_token,
            grant_type: "refresh_token",
          }
        );

        accessToken = data.access_token; 
        return await verifyToken(userId, accessToken);
      } catch (err) {
        if (err.response && error.response.status === 400) {
          throw new Error(
            "Refresh token has expired or been revoked. Please re-authenticate."
          );
        }
      }
    } else {
      throw new Error("Something went wrong: " + error.message);
    }
  }
}

async function verifyJwtToken(userId, accessToken) {
  const decoded = jwt.decode(accessToken);
  if (decoded) {
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      const existingUser = await user
        .findOne({ _id: userId })
        .select("_id email refresh_token");
      const refresh_token_decoded = jwt.decode(existingUser.refresh_token);
      if (
        refresh_token_decoded &&
        refresh_token_decoded.exp &&
        Date.now() >= refresh_token_decoded.exp * 1000
      ) {
        throw new Error(
          "Refresh token has expired or been revoked. Please re-authenticate."
        );
      }
      const new_access_token = jwt.sign(
        { email: existingUser.email, _id: existingUser._id },
        process.env.PRIVATE_KEY,
        { expiresIn: "1d", algorithm: "RS256" }
      );
      accessToken = new_access_token;
      return await verifyJwtToken(userId, accessToken);
    }
    let public_key = "";
    const __dirname = path.resolve();
    const publicKeyPath = path.join(__dirname, "public_key.pem");
    try {
      public_key = fs.readFileSync(publicKeyPath, "utf8");
    } catch (err) {
      console.error("Error reading public key:", err);
      throw new Error("Error reading public key:", err);
    }
    const decodedData = jwt.verify(accessToken, public_key, {
      algorithms: ["RS256"],
    });
    return { usrId: decodedData._id, accessToken };
  } else {
    throw new Error();
  }
}

export const auth = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ message: "Authorization header is missing." });
  }

  const token = req.headers.authorization.split(" ")[1];
  // Additional check to ensure the token exists after splitting
  if (!token) {
    return res.status(401).json({ message: "Token not provided." });
  }

  try {
    if (token && isJwtToken(token)) {
      let { usrId, access_token } = await verifyJwtToken(
        req.headers.userid,
        token
      );
      req.userId = usrId;
      req.access_token = access_token;
    } else {
      let data = await verifyToken(req.headers.userid, token);
      let { usrId, accessToken } = data;
      req.userId = usrId;
      req.access_token = accessToken;
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({error : error.message});
  }

  next();
};
