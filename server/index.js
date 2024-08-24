require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = require("express").Router();
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
// const { User } = require("../models/User");
const {User} = require("./models/User")

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/testing", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(cors());

app.use("/api/users",userRoutes)
app.use("/api/auth",authRoutes)

app.post('/likesong', async (req, res) => {
  const { songId, username } = req.body;

  if (!songId || !username) {
    return res.status(400).json({ error: 'Song ID and username are required' });
  }

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.likedSongs.includes(songId)) {
      user.likedSongs.push(songId);
      await user.save();
    }

    res.status(200).json({ message: 'Song added to liked songs' });
  } catch (error) {
    console.error('Error adding song to liked songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// In your server file
app.get("/getfav", async (req, res) => {
  const { username } = req.query; // Use req.query for GET requests
  // console.log(username)
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ likedSongs: user.likedSongs });
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/deletesong', async (req, res) => {
  const { songId, username } = req.body;

  if (!songId || !username) {
    return res.status(400).json({ error: 'Song ID and username are required' });
  }

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Make sure the songId is treated as a number
    const numericSongId = Number(songId);
    
    // Filter out the songId from the likedSongs array
    const initialLength = user.likedSongs.length;
    user.likedSongs = user.likedSongs.filter(id => id !== numericSongId);
    const finalLength = user.likedSongs.length;

    // Check if the song was actually removed
    if (initialLength === finalLength) {
      return res.status(400).json({ error: 'Song not found in liked songs' });
    }

    await user.save();

    res.status(200).json({ message: 'Song removed from liked songs' });
  } catch (error) {
    console.error('Error removing song from liked songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`RUNNING ON ${port}`);
});
