import jwt from 'jsonwebtoken';

//thanks co-pilot, for once it helped finally
function isJwtToken(token) {
    // Check if token has three parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
        // Decode payload without verification
        const payload = JSON.parse(atob(parts[1]));
        
        // Check for specific payload claims indicative of your JWT
        if (payload.iss === 'YourIssuer' && payload.aud === 'YourAudience') {
            return true; // It's a custom JWT
        }
        
        // Check for Google's issuer
        if (payload.iss === 'accounts.google.com' || payload.iss === 'https://accounts.google.com') {
            return false; // It's a Google OAuth token
        }
    } catch (e) {
        console.error("Error decoding token", e);
        return false;
    }

    // Fallback or additional checks as needed
    return false;
}

async function verifyToken(accessToken) {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);
    const tokenInfo = await response.json();
  
    if (response.ok) {
      const userId = tokenInfo.sub; // This is the 'sub' claim which represents the userId
      return userId;
    } else {
      console.error('Error verifying token:', tokenInfo);
    }
}

export const auth = async (req, res, next) => {
    try {
        // Check if the authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Authorization header is missing." });
        }

        const token = req.headers.authorization.split(" ")[1];
        // Additional check to ensure the token exists after splitting
        if (!token) {
            return res.status(401).json({ message: "Token not provided." });
        }


        let decodeData;
        if (token && isJwtToken(token)) {
            decodeData = jwt.verify(token, 'test'); // Replace 'test' with your actual secret key
            req.userId = decodeData?.id;
        } else {
            req.userId = await verifyToken(token);
        }

        next();
    } catch (error) {
        console.log(error);
        // Respond with a more informative error message
        return res.status(403).json({ message: "Failed to authenticate token." });
    }
};