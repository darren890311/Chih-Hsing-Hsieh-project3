import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Container,
  Spinner,
  InputGroup,
  Form,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { postService } from "../services/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostText, setEditingPostText] = useState("");
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);

  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  const loggedInUser = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const isLoggedIn = () => loggedInUser !== null && token !== null;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      const data = await postService.getAllPosts();
      console.log("Fetched posts:", data);
      setPosts(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch posts error:", err);
      setError("Failed to load posts");
      setLoading(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!isLoggedIn()) {
      alert("You need to log in to like posts!");
      return;
    }
    try {
      const newLikesCount = isLiked
        ? await postService.unlikePost(postId)
        : await postService.likePost(postId);

      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...post, likes: newLikesCount, liked: !isLiked }
            : post
        )
      );
    } catch (err) {
      console.error("Like/Unlike error:", err);
      alert("Failed to update like status");
    }
  };

  const toggleComments = (postId) => {
    setCommentsVisible(commentsVisible === postId ? null : postId);
  };

  const handleAddComment = async (postId) => {
    if (!isLoggedIn()) {
      alert("You need to log in to comment!");
      return;
    }
    if (!newComment.trim()) {
      alert("Comment cannot be empty!");
      return;
    }
    try {
      const comment = await postService.addComment(postId, newComment);
      console.log("Comment added successfully, full response:", comment);

      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), comment],
            };
          }
          return post;
        });
      });

      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
      console.log("Error details:", err.response?.data);
      alert("Failed to add comment");
    }
  };

  const handleEditComment = async (postId, commentId, updatedText) => {
    if (!commentId) {
      console.error("Comment ID is missing");
      return;
    }
    try {
      console.log("Editing comment:", { postId, commentId, updatedText });
      const updatedComment = await postService.updateComment(
        postId,
        commentId,
        updatedText
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment._id === commentId
                  ? { ...comment, text: updatedText }
                  : comment
              ),
            };
          }
          return post;
        })
      );
      setEditingCommentId(null);
    } catch (err) {
      console.error("Edit comment error:", err);
      alert("Failed to update comment");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!commentId) {
      console.error("Comment ID is missing");
      return;
    }
    try {
      console.log("Deleting comment:", { postId, commentId });
      await postService.deleteComment(postId, commentId);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment._id !== commentId
              ),
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Delete comment error:", err);
      alert("Failed to delete comment");
    }
  };

  const handlePost = async () => {
    if (!isLoggedIn()) {
      alert("You need to log in to post!");
      return;
    }
    if (!newPostContent.trim()) {
      alert("Post cannot be empty!");
      return;
    }

    try {
      console.log("Attempting to create post with content:", newPostContent);
      const newPost = await postService.createPost(newPostContent);
      console.log("New post created:", newPost);
      setPosts([newPost, ...posts]);
      setNewPostContent("");
      setShowNewPostModal(false);
    } catch (err) {
      console.error("Post creation error:", err);
      console.error("Error details:", err.response?.data);
      alert(
        err.response?.data?.message ||
          "Failed to create post. Please check the console for error details."
      );
    }
  };

  const handleEditPost = async (postId, updatedText) => {
    try {
      const updatedPost = await postService.updatePost(postId, updatedText);
      setPosts(posts.map((post) => (post._id === postId ? updatedPost : post)));
      setEditingPostId(null);
    } catch (err) {
      console.error("Edit post error:", err);
      alert("Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postService.deletePost(postId);
        setPosts(posts.filter((post) => post._id !== postId));
      } catch (err) {
        console.error("Delete post error:", err);
        alert("Failed to delete post");
      }
    }
  };

  return (
    <Container className="mt-5 pt-5">
      <h1 className="text-center mb-4">Discover 🚀</h1>
      {isLoggedIn() && (
        <Button
          variant="primary"
          className="mb-4"
          onClick={() => setShowNewPostModal(true)}
        >
          + New Post
        </Button>
      )}

      <Modal
        show={showNewPostModal}
        onHide={() => setShowNewPostModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewPostModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePost}>
            Post
          </Button>
        </Modal.Footer>
      </Modal>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <Card key={post._id} className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title className="text-primary">
                <Link
                  to={`/user/${post.username}`}
                  className="text-decoration-none"
                >
                  @{post.username}
                </Link>
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {new Date(post.createdAt).toLocaleString()}
              </Card.Subtitle>

              {editingPostId === post._id ? (
                <InputGroup>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editingPostText}
                    onChange={(e) => setEditingPostText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="ms-2"
                    variant="primary"
                    onClick={() => handleEditPost(post._id, editingPostText)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className="ms-2"
                    variant="danger"
                    onClick={() => setEditingPostId(null)}
                  >
                    Cancel
                  </Button>
                </InputGroup>
              ) : (
                <Card.Text>{post.content}</Card.Text>
              )}

              {loggedInUser && post.username === loggedInUser && (
                <>
                  <Button
                    variant="link"
                    className="text-primary p-0 ms-2"
                    onClick={() => {
                      setEditingPostId(post._id);
                      setEditingPostText(post.content);
                    }}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="link"
                    className="text-danger p-0 ms-2"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    ❌
                  </Button>
                </>
              )}

              <div className="mt-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => toggleComments(post._id)}
                  className="me-2"
                >
                  💬 Comments ({post.comments?.length || 0})
                </Button>

                <Button
                  variant={post.liked ? "danger" : "outline-danger"}
                  size="sm"
                  onClick={() => handleLike(post._id, post.liked)}
                >
                  ❤️ {post.likes || 0}
                </Button>
              </div>

              {commentsVisible === post._id && (
                <div className="mt-3">
                  <h6>Comments</h6>
                  {post.comments?.map((comment) => (
                    <Card key={comment._id} className="mb-2">
                      <Card.Body>
                        <strong>
                          <Link
                            to={`/user/${comment.username}`}
                            className="text-decoration-none"
                          >
                            @{comment.username}
                          </Link>
                        </strong>
                        : {comment.text}
                        {loggedInUser && comment.username === loggedInUser && (
                          <>
                            {editingCommentId === comment._id ? (
                              <InputGroup>
                                <Form.Control
                                  type="text"
                                  value={editingCommentText}
                                  className="comment-input"
                                  onChange={(e) =>
                                    setEditingCommentText(e.target.value)
                                  }
                                />
                                <Button
                                  size="sm"
                                  variant="primary"
                                  className="ms-2"
                                  onClick={() =>
                                    handleEditComment(
                                      post._id,
                                      comment._id,
                                      editingCommentText
                                    )
                                  }
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setEditingCommentId(null)}
                                  className="ms-2"
                                >
                                  Cancel
                                </Button>
                              </InputGroup>
                            ) : (
                              <>
                                <Button
                                  variant="link"
                                  className="text-primary p-0 ms-2"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditingCommentText(comment.text);
                                  }}
                                >
                                  ✏️
                                </Button>
                                <Button
                                  variant="link"
                                  className="text-danger p-0 ms-2"
                                  onClick={() =>
                                    handleDeleteComment(post._id, comment._id)
                                  }
                                >
                                  ❌
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                  <InputGroup className="mt-3">
                    <Form.Control
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAddComment(post._id)}
                      className="ms-2"
                    >
                      Post
                    </Button>
                  </InputGroup>
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      ) : (
        <p className="text-center">No posts yet :(</p>
      )}
    </Container>
  );
}
