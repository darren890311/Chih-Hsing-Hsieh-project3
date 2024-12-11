import axios from "axios";

const BASE_URL = "https://chih-hsing-hsieh-project3-backend.onrender.com";

const setupInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      console.log("Request config:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      console.log("Response:", {
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error("Response error:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
};

export const authService = {
  register: async (username, password) => {
    try {
      console.log("Registering user:", username);
      const response = await axios.post(`${BASE_URL}/register`, {
        username,
        password,
      });
      console.log("Registration successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  login: async (username, password) => {
    try {
      console.log("Logging in user:", username);
      const response = await axios.post(`${BASE_URL}/login`, {
        username,
        password,
      });
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  logout: () => {
    console.log("Logging out user");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  },
};

export const postService = {
  getAllPosts: async () => {
    try {
      console.log("Fetching all posts");
      const response = await axios.get(`${BASE_URL}/posts`);
      console.log("Fetched posts:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get posts error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  createPost: async (content) => {
    try {
      console.log("Creating post with content:", content);
      const token = localStorage.getItem("token");
      console.log("Using token:", token);

      const response = await axios.post(`${BASE_URL}/posts`, { content });
      console.log("Post created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create post error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  updatePost: async (postId, content) => {
    try {
      console.log("Updating post:", postId);
      const response = await axios.put(`${BASE_URL}/posts/${postId}`, {
        content,
      });
      console.log("Post updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Update post error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  deletePost: async (postId) => {
    try {
      console.log("Deleting post:", postId);
      const response = await axios.delete(`${BASE_URL}/posts/${postId}`);
      console.log("Post deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("Delete post error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  addComment: async (postId, text) => {
    try {
      console.log("Adding comment to post:", postId);
      const response = await axios.post(
        `${BASE_URL}/posts/${postId}/comments`,
        { text }
      );
      console.log("Comment added:", response.data);
      return response.data;
    } catch (error) {
      console.error("Add comment error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  updateComment: async (postId, commentId, text) => {
    try {
      console.log("Updating comment:", { postId, commentId, text });
      const response = await axios.put(
        `${BASE_URL}/posts/${postId}/comments/${commentId}`,
        { text }
      );
      return response.data;
    } catch (error) {
      console.error("Update comment error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      console.log("Deleting comment:", { postId, commentId });
      const response = await axios.delete(
        `${BASE_URL}/posts/${postId}/comments/${commentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Delete comment error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  likePost: async (postId) => {
    try {
      console.log("Liking post:", postId);
      const response = await axios.post(`${BASE_URL}/posts/${postId}/like`);
      console.log("Post liked:", response.data);
      return response.data.likes;
    } catch (error) {
      console.error("Like post error:", error.response?.data || error);
      throw error.response?.data || { message: "Failed to like post" };
    }
  },

  unlikePost: async (postId) => {
    try {
      console.log("Unliking post:", postId);
      const response = await axios.post(`${BASE_URL}/posts/${postId}/unlike`);
      console.log("Post unliked:", response.data);
      return response.data.likes;
    } catch (error) {
      console.error("Unlike post error:", error.response?.data || error);
      throw error.response?.data || { message: "Failed to unlike post" };
    }
  },
  getUserPosts: async (username) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${username}/posts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

setupInterceptors();

export default { authService, postService };
