import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getDB, client } from "./db.js";

export const createAuth = () => {
  return betterAuth({
    database: mongodbAdapter(getDB(), {
      client,
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,

    emailAndPassword: {
      enabled: true,
    },

    user: {
      modelName: "users",
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "student",
          input: true,
        },
        phone: {
          type: "string",
          required: false,
          input: false,
        },
        bio: {
          type: "string",
          required: false,
          input: false,
        },
        plan: {
          type: "string",
          required: true,
          defaultValue: "free",
          input: false,
        },
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!["student", "tutor"].includes(user.role)) {
              return false;
            }

            return {
              data: {
                ...user,
                plan: "free",
              },
            };
          },
        },
      },
    },
  });
};
