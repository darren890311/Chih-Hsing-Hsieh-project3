import axios from "axios";

const BASE_URL = "https://chih-hsing-hsieh-project3-backend.onrender.com/api";

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
      const response = await axios.post(`${BASE_URL}/register`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  },
};

export const postService = {
  getAllPosts: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/posts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createPost: async (content) => {
    try {
      const response = await axios.post(`${BASE_URL}/posts`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updatePost: async (postId, content) => {
    try {
      const response = await axios.put(`${BASE_URL}/posts/${postId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addComment: async (postId, text) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/posts/${postId}/comments`,
        { text }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateComment: async (postId, commentId, text) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/posts/${postId}/comments/${commentId}`,
        { text }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/posts/${postId}/comments/${commentId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  likePost: async (postId) => {
    try {
      const response = await axios.post(`${BASE_URL}/posts/${postId}/like`);
      return response.data.likes;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  unlikePost: async (postId) => {
    try {
      const response = await axios.post(`${BASE_URL}/posts/${postId}/unlike`);
      return response.data.likes;
    } catch (error) {
      throw error.response?.data || error;
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
