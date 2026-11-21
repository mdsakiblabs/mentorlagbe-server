import { createRemoteJWKSet, jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { getCollections } from "../config/collections.js";
const authURL = process.env.BETTER_AUTH_URL;

const JWKS = createRemoteJWKSet(new URL(`${authURL}/api/auth/jwks`));

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authURL,
      audience: authURL,
    });

    if (
      !payload.id ||
      !payload.email ||
      !["student", "tutor", "admin"].includes(payload.role)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token payload.",
      });
    }

    const { users } = getCollections();

    const currentUser = await users.findOne(
      { _id: new ObjectId(payload.id) },
      { projection: { email: 1, role: 1 } },
    );

    if (
      !currentUser ||
      currentUser.email !== payload.email ||
      currentUser.role !== payload.role
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized: User information has changed. Please login again.",
      });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token.",
    });
  }
};
