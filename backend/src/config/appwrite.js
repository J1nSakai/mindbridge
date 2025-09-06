import { Client, Users, TablesDB } from "node-appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export const UsersService = new Users(client);
export const TablesDataB = new TablesDB(client);
