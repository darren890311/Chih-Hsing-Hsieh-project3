require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("./models/post");
const User = require("./models/user");

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.SECRET_KEY;
app.use(express.json());

app.use(
  cors({
    origin: ["https://chih-hsing-hsieh-project3.onrender.com"],
    credentials: true,
  })
);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
    console.log("Database URI:", process.env.MONGODB_URI);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const authenticateToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Auth Header:", authHeader);
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    console.log("Verifying token:", token);
    const verified = jwt.verify(token, SECRET_KEY);
    console.log("Verified token data:", verified);

    const user = await User.findById(verified.id);
    if (!user) {
      console.log("User not found for id:", verified.id);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: verified.id,
      username: user.username,
    };
    console.log("User set in request:", req.user);
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  console.log("Registration attempt for username:", username);

  if (!username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Username already exists:", username);
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    console.log("User registered successfully:", username);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt for username:", username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for user:", username);
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: "24h" }
    );
    console.log("Login successful for user:", username);
    console.log("Generated token:", token);
    res.json({ token, username: user.username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    console.log("Fetching all posts");
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log(`Found ${posts.length} posts`);
    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    console.log("=== Creating Post Debug Info ===");
    console.log("Request user:", req.user);
    console.log("Request body:", req.body);
    console.log("Token verification:", req.headers.authorization);

    if (!req.body.content) {
      console.log("Content missing in request");
      return res.status(400).json({ message: "Content is required" });
    }

    if (!req.user || !req.user.username) {
      console.log("User information missing:", req.user);
      return res.status(401).json({ message: "User information missing" });
    }

    const newPost = new Post({
      username: req.user.username,
      content: req.body.content,
    });

    console.log("Attempting to save post:", newPost);
    const savedPost = await newPost.save();
    console.log("Post saved successfully:", savedPost);
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("Create post detailed error:", {
      error: err,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      message: "Failed to create post",
      error: err.message,
      details: err.stack,
    });
  }
});

app.put("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    console.log("Updating post:", req.params.id);
    console.log("New content:", req.body.content);

    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.username !== req.user.username) {
      console.log("Unauthorized update attempt by user:", req.user.username);
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    );
    console.log("Post updated:", updatedPost);
    res.json(updatedPost);
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    console.log("Deleting post:", req.params.id);

    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.username !== req.user.username) {
      console.log("Unauthorized delete attempt by user:", req.user.username);
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    console.log("Post deleted successfully");
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

app.post("/api/posts/:id/like", authenticateToken, async (req, res) => {
  try {
    console.log("Liking post:", req.params.id);
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    post.likes += 1;
    await post.save();
    console.log("Post liked successfully. New likes count:", post.likes);

    res.json({ likes: post.likes });
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ message: "Failed to like post" });
  }
});

app.post("/api/posts/:id/unlike", authenticateToken, async (req, res) => {
  try {
    console.log("Unliking post:", req.params.id);
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes > 0) {
      post.likes -= 1;
      await post.save();
      console.log("Post unliked successfully. New likes count:", post.likes);
    }

    res.json({ likes: post.likes });
  } catch (err) {
    console.error("Unlike post error:", err);
    res.status(500).json({ message: "Failed to unlike post" });
  }
});

app.post("/api/posts/:id/comments", authenticateToken, async (req, res) => {
  try {
    console.log("Adding comment to post:", req.params.id);
    console.log("Comment text:", req.body.text);

    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      username: req.user.username,
      text: req.body.text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];
    console.log("Saved comment:", savedComment);

    res.status(201).json({
      _id: savedComment._id,
      text: savedComment.text,
      username: savedComment.username,
      createdAt: savedComment.createdAt,
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

app.put(
  "/api/posts/:id/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    try {
      console.log("Updating comment:", {
        postId: req.params.id,
        commentId: req.params.commentId,
        newText: req.body.text,
      });

      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.username !== req.user.username) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this comment" });
      }

      comment.text = req.body.text;
      await post.save();

      res.json(comment);
    } catch (err) {
      console.error("Update comment error:", err);
      res
        .status(500)
        .json({ message: "Failed to update comment", error: err.message });
    }
  }
);

app.delete(
  "/api/posts/:id/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    try {
      console.log("Deleting comment:", {
        postId: req.params.id,
        commentId: req.params.commentId,
      });

      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const commentIndex = post.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );

      if (commentIndex === -1) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (post.comments[commentIndex].username !== req.user.username) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this comment" });
      }

      post.comments.pull({ _id: req.params.commentId });
      await post.save();

      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Delete comment error:", err);
      res
        .status(500)
        .json({ message: "Failed to delete comment", error: err.message });
    }
  }
);
app.get("/api/users/:username/posts", async (req, res) => {
  try {
    const { username } = req.params;
    const userPosts = await Post.find({ username }).sort({ createdAt: -1 });
    res.json(userPosts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
