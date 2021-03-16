import {
  NEW_COMMENT_SUCCESS,
  NEW_COMMENT_REQUEST,
  NEW_REPLY_SUCCESS,
  NEW_REPLY_REQUEST,
  VOTE_CAST,
} from "../types";
import axios from "axios";
export function newCommentRequest() {
  return {
    type: NEW_COMMENT_REQUEST,
  };
}

function newCommentSuccess(savedComment) {
  return (dispatch, getState) => {
    console.log(savedComment, "<-----");
    let id = savedComment._id;
    let postId = savedComment.postId;
    dispatch({ type: NEW_COMMENT_SUCCESS, savedComment, id, postId });
  };
}
export function newComment(content, postId) {
  return (dispatch, getState) => {
    dispatch(newCommentRequest());
    return axios({
      url: "/api/comment/new",
      method: "POST",
      data: {
        content: content,
        postId: postId,
      },
      withCredentials: true,
    }).then((res) => {
      let submittedComment = res.data;

      dispatch(newCommentSuccess(submittedComment));
    });
  };
}
export function newReplyRequest() {
  return {
    type: NEW_REPLY_REQUEST,
    test: {},
  };
}
export function test(test) {
  return (dispatch, getState) => {
    dispatch(test.push("sdfsdf"));
  };
}

export function changeCommentPoint(point, postId, commentId) {
  return (dispatch, getState) => {
    let currentCommentId = commentId;
    let currentComment = getState().comments.byId[currentCommentId];
    let currentVoteState = currentComment.voteState;
    dispatch({ type: VOTE_CAST, point, commentId, currentVoteState });
    if (point === 1) {
      axios({
        url: `/api/comment/vote-up`,
        method: "PUT",
        data: {
          postId: postId,
          commentId: commentId,
        },
        withCredentials: true,
      });
    }
    if (point === -1) {
      axios({
        url: `/api/comment/vote-down`,
        method: "PUT",
        data: {
          postId: postId,
          commentId: commentId,
        },
        withCredentials: true,
      });
    }
  };
}
export function newReply(content, postId, commentId) {
  return (dispatch, getState) => {
    return axios({
      url: `/api/comments/${commentId}/replies`,
      method: "POST",
      data: {
        content: content,
        postId: postId,
      },
      withCredentials: true,
    }).then((res) => {
      dispatch(newCommentSuccess(res.data));
    });
  };
}
