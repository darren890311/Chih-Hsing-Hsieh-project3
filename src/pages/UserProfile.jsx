import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Card,
  ListGroup,
  Button,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { postService } from "../services/api";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBio, setNewBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostText, setEditingPostText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentsVisible, setCommentsVisible] = useState(null);
  const [newComment, setNewComment] = useState("");

  const loggedInUser = localStorage.getItem("username");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = {
          username: username,
          description: "",
          joinedAt: new Date().toISOString(),
        };
        setUser(userData);
        setNewBio(userData.description || "");

        const userPosts = await postService.getUserPosts(username);
        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handleSaveBio = () => {
    if (user) {
      setUser({ ...user, description: newBio });
      setEditingBio(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
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

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty!");
      return;
    }
    try {
      const comment = await postService.addComment(postId, newComment);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), comment] }
            : post
        )
      );
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Failed to add comment");
    }
  };

  const handleEditComment = async (postId, commentId, updatedText) => {
    try {
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
    try {
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

  if (loading) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <div className="alert alert-warning">User not found</div>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5">
      <Card className="mb-4 shadow">
        <Card.Body>
          <Card.Title className="text-primary">@{user.username}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Joined {new Date(user.joinedAt).toLocaleDateString()}
          </Card.Subtitle>

          {editingBio ? (
            <InputGroup>
              <Form.Control
                as="textarea"
                rows={2}
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
              />
              <Button
                size="sm"
                variant="primary"
                className="ms-2 comment-button"
                onClick={handleSaveBio}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="ms-2 comment-button"
                onClick={() => setEditingBio(false)}
              >
                Cancel
              </Button>
            </InputGroup>
          ) : (
            <Card.Text>
              {user.description || "No bio added yet."}
              {loggedInUser === username && (
                <Button
                  variant="link"
                  className="ms-2 p-0"
                  onClick={() => setEditingBio(true)}
                >
                  ✏️ Edit Bio
                </Button>
              )}
            </Card.Text>
          )}
        </Card.Body>
      </Card>

      <h3>Posts</h3>
      {posts.length > 0 ? (
        <ListGroup>
          {posts.map((post) => (
            <ListGroup.Item key={post._id}>
              <div className="mb-2">
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
                      className="ms-2 comment-button"
                      variant="primary"
                      onClick={() => handleEditPost(post._id, editingPostText)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      className="ms-2 comment-button"
                      variant="danger"
                      onClick={() => setEditingPostId(null)}
                    >
                      Cancel
                    </Button>
                  </InputGroup>
                ) : (
                  <>
                    <p className="mb-1">{post.content}</p>
                    {loggedInUser === post.username && (
                      <div className="mb-2">
                        <Button
                          variant="link"
                          className="text-primary p-0 me-2"
                          onClick={() => {
                            setEditingPostId(post._id);
                            setEditingPostText(post.content);
                          }}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          ❌
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Posted on {new Date(post.createdAt).toLocaleString()}
                </small>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setCommentsVisible(post._id)}
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
              </div>

              {commentsVisible === post._id && (
                <div className="mt-3">
                  <h6>Comments</h6>
                  {post.comments?.map((comment) => (
                    <Card key={comment._id} className="mb-2">
                      <Card.Body>
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
                          </Card.Body>
                        </Card>
                        {loggedInUser === comment.username && (
                          <>
                            {editingCommentId === comment._id ? (
                              <InputGroup>
                                <Form.Control
                                  type="text"
                                  value={editingCommentText}
                                  onChange={(e) =>
                                    setEditingCommentText(e.target.value)
                                  }
                                />
                                <Button
                                  size="sm"
                                  variant="primary"
                                  className="ms-2 comment-button"
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
                                  size="sm comment-button"
                                  variant="danger"
                                  className="ms-2"
                                  onClick={() => setEditingCommentId(null)}
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
                      className="ms-2 comment-button"
                    >
                      Post
                    </Button>
                  </InputGroup>
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            <Card.Text>No posts yet</Card.Text>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
