const express = require('express');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const cors = require("cors");
const {createServer} = require('node:http');
const mongoose = require('mongoose');
dotenv.config();

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
const port = process.env.PORT || 3000;

app.use(express.json());
const openai = new OpenAI();

const MessageSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

MessageModel = mongoose.model('Message', MessageSchema);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/lecture1');
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

io.on('connection', async (socket) => {
  console.log("Connected");
  io.emit('messages', await MessageModel.find({}).sort({ createdAt: "asc" }).exec());
});

app.post('/gpt', async (req, res) => {
  const { text } = req.body;

  const completion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: text,
    }],
    model: "gpt-3.5-turbo",
    stream: true
  });

  await new MessageModel({
    author: "user",
    content: text
  }).save();

  io.emit('messages', await MessageModel.find({}).sort({ createdAt: "asc"}).exec());

  let data = "";
  for await (const chunk of completion) {
    data += chunk.choices[0].delta.content !== undefined ? chunk.choices[0].delta.content : "";
    const arr = await MessageModel.find({}).sort({ createdAt: "asc"}).exec();
    arr.push(
        {
          author: "bot",
          content: data
        }
    )
    io.emit('messages', arr);
    console.log("Sent");
  }

  await new MessageModel({
    author: "bot",
    content: data
  }).save();

  res.json({ response: 'Ok' });
});

server.listen(port, () => {
  console.log('Server is running on http://localhost:3000');
});