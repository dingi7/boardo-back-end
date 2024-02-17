import Pusher from "pusher";

// use .env file

const pusher = new Pusher({
    appId: "1757153",
    key: "b6ea70f2b0bc14153ae1",
    secret: "e175bd66d43d8279a6d5",
    cluster: "eu",
    useTLS: true
  });
  

export default pusher;