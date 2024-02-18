import Pusher from "pusher";

// use .env file
require('dotenv').config()

const appId = process.env.PUSHER_APP_ID || "123456";
const key = process.env.PUSHER_KEY || "123456";
const secret = process.env.PUSHER_SECRET || "123456";

const pusher = new Pusher({
    appId,
    key,
    secret,
    cluster: "eu",
    useTLS: true
  });
  

export default pusher;