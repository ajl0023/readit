import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { newComment } from "../actions/commentActions";
import {
  changePoint,
  editPost,
  fetchSinglePost,
  splicePost,
} from "../actions/postActions";
import downvote from "../images/down-arrow.svg";
import { ReactComponent as Edit } from "../images/edit.svg";
import upvote from "../images/up-arrow.svg";
import Comment from "./Comment";

const PostModal = (props) => {
  const params = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const [commentText, setCommentText] = useState("");
  const [edit, setEdit] = useState(false);
  const [editText, setEditText] = useState("");

  const currentUser = useSelector((state) => state.currentUser._id);
  const allIds = useSelector((state) => {
    return state.posts.allIds;
  });
  const comments = useSelector((state) => {
    return {
      test: state.comments.byId,
    };
  });

  const loggedIn = useSelector((state) => state.login.isLoggedIn);

  let currentPost = props.post;
  const sortOrder = useSelector((state) => {
    return state.listings.sortOrder;
  });
  const back = (e) => {
    e.stopPropagation();
  };
  const handleReroute = () => {
    if (currentPost.newPost) {
      dispatch(splicePost(params.id));
    }
    if (currentPost.newPost || sortOrder === "default") {
      history.push("/");
    } else {
      history.goBack();

      document.body.style.overflow = "";
    }
  };
  const handleSubmitComment = () => {
    dispatch(newComment(commentText, params.id));
    setCommentText("");
  };
  const handleUpvote = () => {
    if (loggedIn) {
      dispatch(changePoint(1, params.id));
    } else {
      props.handleShowLogin();
    }
  };
  const handleDownVote = () => {
    if (loggedIn) {
      dispatch(changePoint(-1, params.id));
    } else {
      props.handleShowLogin();
    }
  };
  const handleEdit = () => {
    setEdit(true);
  };

  const handleCancelEdit = () => {
    setEdit(false);
  };
  const saveEdit = (id) => {
    dispatch(editPost(id, editText));
    setEdit(false);
  };
  useEffect(() => {
    if (!allIds.includes(params.id)) {
      dispatch(fetchSinglePost(params.id));
    }
  }, []);

  if (!currentPost) {
    return <div></div>;
  }
  const date = new Date(currentPost.createdAt);
  const formatDate = new Intl.DateTimeFormat("en-US", {}).format(date);

  return (
    <div onClick={handleReroute} className="modal-wrapper">
      <div onClick={back} className="card-modal">
        {currentPost.author ? (
          <>
            <p className="card-modal-author">
              {" "}
              u/{currentPost.author.username}
            </p>
            <p>{formatDate}</p>
            <h4 className="card-modal-title">{currentPost.title}</h4>
            {currentUser === currentPost.author._id ? (
              <div className="edit-container">
                <p
                  className={`card-modal-content ${edit ? "inactive" : null} `}
                >
                  {currentPost.content}
                </p>

                <textarea
                  onChange={(e) => {
                    setEditText(e.target.value);
                  }}
                  className={edit ? "edit-text-area" : "inactive"}
                  value={editText}
                ></textarea>
                <div className={edit ? `edit-button-container` : `inactive`}>
                  <button
                    onClick={() => saveEdit(currentPost._id)}
                    className="edit-submit-button"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="edit-cancel-button"
                  >
                    Cancel
                  </button>
                </div>
                <button
                  className={`edit-button ${edit ? "inactive" : null}`}
                  onClick={handleEdit}
                >
                  <Edit />
                </button>
              </div>
            ) : null}
            <img className="post-image" src={props.post.image} alt="" />
            {currentUser ? (
              <div className="new-comment-container">
                <textarea
                  className="new-comment"
                  name=""
                  id=""
                  placeholder="What are your thoughts?"
                  rows="6"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <span className="submit-comment-container">
                  <button
                    onClick={() => {
                      handleSubmitComment();
                    }}
                    className="submit-comment-button"
                  >
                    Comment
                  </button>
                </span>
              </div>
            ) : (
              <div className="no-user-comment-container">
                <p className="no-user-comment">
                  Log in or sign up to leave a comment
                </p>
                <div className="auth-button-container">
                  <button onClick={props.handleShowLogin}>log in</button>

                  <button onClick={props.handleShowSignup}>sign up</button>
                </div>
              </div>
            )}
            <div className="card-modal-vote-container">
              <li onClick={handleUpvote}>
                <img
                  className={
                    currentPost.voteState === 1
                      ? `vote-button-color`
                      : `vote-button`
                  }
                  src={upvote}
                  alt=""
                />
              </li>
              <li>{currentPost.voteTotal}</li>

              <li onClick={handleDownVote}>
                <img
                  className={
                    currentPost.voteState === -1
                      ? `vote-button-color`
                      : `vote-button`
                  }
                  src={downvote}
                  alt=""
                />
              </li>
            </div>
            <h4 className="comment-section-header">Comments</h4>
            {props.post.comments.map((a) => {
              return (
                <Comment
                  handleShowLogin={props.handleShowLogin}
                  key={a}
                  comment={comments.test[a]}
                />
              );
            })}
          </>
        ) : null}
      </div>
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  let id = ownProps.match.params.id;
  let post;
  post = state.posts.byId[id];
  return {
    post: post,
  };
}
export default connect(mapStateToProps)(PostModal);
