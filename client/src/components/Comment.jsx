import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  changeCommentPoint,
  newReply,
  newReplyRequest,
} from "../actions/commentActions";
import downvote from "../images/down-arrow.svg";
import upvote from "../images/up-arrow.svg";
const Comment = ({ comment, handleShowLogin }) => {
  const allComments = useSelector((state) => {
    return state.comments.byId;
  });
  const loggedIn = useSelector((state) => state.login.isLoggedIn);

  const dispatch = useDispatch();
  const params = useParams();
  const [replyText, setReplyText] = useState("");
  const [replyToggle, setReplyToggle] = useState(false);
  const voteUp = () => {
    if (loggedIn) {
      dispatch(changeCommentPoint(1, params.id, comment._id));
    } else {
      handleShowLogin();
    }
  };
  const voteDown = () => {
    if (loggedIn) {
      dispatch(changeCommentPoint(-1, params.id, comment._id));
    } else {
      handleShowLogin();
    }
  };
  const handleReplyToggle = () => {
    setReplyToggle(!replyToggle);
    dispatch(newReplyRequest());
  };

  const handleReply = () => {
    let commentId = comment._id;
    dispatch(newReply(replyText, params.id, commentId));
    setReplyToggle(false);
    setReplyText("");
  };

  useEffect(() => {}, []);
  if (!comment) {
    return <div></div>;
  }
  const nestedComments = (comment.comments || []).map((comment) => {
    return <Comment key={comment} comment={allComments[comment]} />;
  });
  return (
    <div style={{ marginLeft: "15px", marginTop: "10px" }}>
      <div className="comment-vote-title-container">
        <div className="comment-vote-container">
          <div className="comment-vote-button-container">
            <img
              className={
                comment.voteState === 1
                  ? "comment-vote-button-color"
                  : "comment-vote-button"
              }
              src={upvote}
              onClick={voteUp}
              alt=""
            />
            <span>{comment.voteTotal}</span>
            <img
              className={
                comment.voteState === -1
                  ? "comment-vote-button-color"
                  : "comment-vote-button"
              }
              src={downvote}
              onClick={voteDown}
            />
          </div>
        </div>
        <div className="comment-container">
          <p className="comment-author">{comment.authorName}</p>
          <div className="parent-comment">{comment.content}</div>
          <div className="reply-button-container">
            {loggedIn ? (
              <button onClick={handleReplyToggle} className="reply-button">
                Reply
              </button>
            ) : null}
            {replyToggle ? (
              <div className="new-comment-container">
                <textarea
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                  }}
                  placeholder="What are your thoughts?"
                  className="new-comment reply-textarea"
                  rows="6"
                ></textarea>
                <div className="submit-comment-container">
                  <button
                    onClick={handleReply}
                    className="submit-comment-button"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="nested-comments">{nestedComments}</div>
    </div>
  );
};

export default Comment;
