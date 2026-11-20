import { getDB } from "./db.js";

export const getCollections = () => {
  const db = getDB();

  return {
    users: db.collection("users"),
    tuitions: db.collection("tuitions"),
    applications: db.collection("applications"),
    payments: db.collection("payments"),
  };
};
