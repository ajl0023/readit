import {
  RECEIVE_POSTS,
  REQUEST_POSTS,
  REQUEST_SINGLE_POST,
  RECEIVE_SINGLE_POSTS,
  POST_CREATION_CHANGE_SUBMISSION_TYPE,
  NEW_POST_SUCCESS,
  NEW_POST_REQUEST,
  RESET_POST,
  CHANGE_TO_MEDIA,
  VOTE_CAST,
  NEXT_PAGE,
  PREV_PAGE,
  DELETE_POST,
  EDIT_POST,
  SET_POST_MODAL,
  SPLICED_POST,
  SET_POST,
  SORT_POSTS,
} from "../types";
import { normalize } from "normalizr";
import { post } from "../schemas";
import axios from "axios";

function requestPosts() {
  return {
    type: REQUEST_POSTS,
  };
}
export function splicePost(id) {
  return (dispatch, getState) => {
    let newObj = {};
    const allIds = getState().posts.allIds;
    const allPosts = getState().posts.byId;
    const arrayOfPosts = allIds.map((post) => {
      return allPosts[post];
    });
    let splicedArray = allIds.filter((postId) => {
      if (id !== postId) {
        return postId;
      }
    });
    let splicedPosts = arrayOfPosts.filter((post) => {
      if (!post.newPost && post._id !== id) {
        return post;
      }
    });
    splicedPosts.map((post) => {
      newObj[post._id] = post;
    });

    dispatch({ type: SPLICED_POST, newObj, splicedArray });
  };
}
function receivePosts(data, sort) {
  return (dispatch, getState) => {
    let arrayOfNewIds = getState().posts.createdPosts;
    arrayOfNewIds = Object.keys(arrayOfNewIds);
    const currentPostIds = getState().posts.allIds;

    dispatch({
      type: RECEIVE_POSTS,
      data,
      arrayOfNewIds,
      sort,
    });
  };
}

function submitPostSuccess(post) {
  let id = post._id;
  post["newPost"] = true;
  return (dispatch, getState) => {
    dispatch({ type: NEW_POST_SUCCESS, post, id });
  };
}

export function newPostSubmissionType(postType) {
  return (dispatch, getState) => {
    dispatch({ type: POST_CREATION_CHANGE_SUBMISSION_TYPE, postType });
  };
}
export function changePostSubmissionType(postType) {
  return (dispatch, getState) => {
    let currentValue = getState().changeNewSubmissionType.submissionType;

    if (postType === currentValue) {
      return;
    } else {
      dispatch({
        type: POST_CREATION_CHANGE_SUBMISSION_TYPE,
        postType,
      });
    }
  };
}

export function changePoint(point, postId) {
  return (dispatch, getState) => {
    let currentPostId = postId;
    let currentPost = getState().posts.byId[currentPostId];
    let currentVoteState = currentPost.voteState;
    dispatch({
      type: VOTE_CAST,
      postId,
      point,
      currentVoteState,
    });
    if (point === 1) {
      return axios({
        url: `/api/posts/vote-up/${currentPostId}`,
        method: "PUT",
        withCredentials: true,
      });
    }
    if (point === -1) {
      return axios({
        url: `/api/posts/vote-down/${currentPostId}`,
        method: "PUT",
        withCredentials: true,
      });
    }
  };
}
export function setPostModal(post) {
  return {
    type: SET_POST_MODAL,
    post,
  };
}
export function submitPostAttempt() {
  return {
    type: NEW_POST_REQUEST,
  };
}
export function submitPost(form) {
  return (dispatch) => {
    return axios({
      url: `/api/post/new/`,
      method: "POST",
      data: form,

      withCredentials: true,
    }).then((res) => {
      if (res.status === 200) {
        dispatch(submitPostSuccess(res.data));
      }
    });
  };
}
function requestSinglePost() {
  return {
    type: REQUEST_SINGLE_POST,
  };
}
export function reset() {
  return {
    type: RESET_POST,
  };
}
function receiveSinglePost(post) {
  let temp = {};
  let id = post._id;

  temp[post._id] = post;
  return {
    type: RECEIVE_SINGLE_POSTS,
    id,
    temp,
  };
}
export function deletePost(postId) {
  return (dispatch) => {
    dispatch({ type: DELETE_POST, postId });
    return axios({
      url: `/api/delete/${postId}`,
      method: "DELETE",
      withCredentials: true,
    });
  };
}
export function editPost(postId, content) {
  return (dispatch, getState) => {
    dispatch({ type: EDIT_POST, postId, content });
    return axios({
      url: `/api/edit/${postId}`,
      method: "PUT",
      withCredentials: true,
      data: {
        content: content,
      },
    });
  };
}
export function prevPage(count, id, sort) {
  return (dispatch, getState) => {
    let currentPosts = getState().posts.byId;
    let currentPostsIds = getState().posts.allIds;

    let arrayOfCurrentPosts = currentPostsIds.map((id) => {
      return currentPosts[id];
    });

    dispatch(requestPosts());
    if (sort) {
      return axios({
        url: `/api/posts/${sort}?page[size]=${count}&firstId=${id}`,
        method: "GET",
        withCredentials: true,
      }).then((posts) => {
        const normalizedData = normalize(posts.data, [post]);
        const idsofNewData = normalizedData.result;
        const newPostsArray = idsofNewData.map((id) => {
          return normalizedData.entities.posts[id];
        });
        const newPosts = normalizedData.entities.posts;
        dispatch({
          type: PREV_PAGE,
          idsofNewData,
          sort,
          newPosts,
          newPostsArray,
          currentPosts,
          arrayOfCurrentPosts,
        });
      });
    }
    if (!sort) {
      return axios({
        url: `/api/posts?page[size]=${count}&firstId=${id}`,
        method: "GET",
        withCredentials: true,
      }).then((posts) => {
        const normalizedData = normalize(posts.data, [post]);
        const idsofNewData = normalizedData.result;
        const newPostsArray = idsofNewData.map((id) => {
          return normalizedData.entities.posts[id];
        });
        const newPosts = normalizedData.entities.posts;
        dispatch({
          type: PREV_PAGE,
          idsofNewData,
          newPosts,
          sort,

          newPostsArray,
          currentPosts,
          arrayOfCurrentPosts,
        });
        return "completed";
      });
    }
  };
}
export function nextPage(count, id, sort) {
  return (dispatch, getState) => {
    let currentPosts = getState().posts.byId;
    let currentPostsIds = getState().posts.allIds;

    let arrayOfCurrentPosts = currentPostsIds.map((id) => {
      return currentPosts[id];
    });

    dispatch(requestPosts());

    if (sort) {
      return axios({
        url: `/api/posts/${sort}?page[size]=${count}&lastId=${id}`,
        method: "GET",
        withCredentials: true,
      }).then((posts) => {
        const normalizedData = normalize(posts.data, [post]);
        const idsofNewData = normalizedData.result;
        const newPostsArray = idsofNewData.map((id) => {
          return normalizedData.entities.posts[id];
        });
        const newPosts = normalizedData.entities.posts;
        dispatch({
          type: NEXT_PAGE,
          sort,
          idsofNewData,
          newPosts,
          newPostsArray,
          currentPosts,
          arrayOfCurrentPosts,
        });
      });
    }
    if (!sort) {
      return axios({
        url: `/api/posts?page[size]=${count}&lastId=${id}`,
        method: "GET",
        withCredentials: true,
      }).then((posts) => {
        const normalizedData = normalize(posts.data, [post]);
        const idsofNewData = normalizedData.result;
        const newPostsArray = idsofNewData.map((id) => {
          return normalizedData.entities.posts[id];
        });
        const newPosts = normalizedData.entities.posts;
        dispatch({
          type: NEXT_PAGE,
          idsofNewData,
          newPosts,
          newPostsArray,
          currentPosts,
          arrayOfCurrentPosts,
        });
        return "completed";
      });
    }
  };
}
export function sortBy(sortType) {
  return (dispatch, getState) => {
    let currentPosts = getState().posts.byId;
    let currentPostsIds = getState().posts.allIds;

    let arrayOfCurrentPosts = currentPostsIds.map((id) => {
      return currentPosts[id];
    });
    dispatch(requestPosts());

    return axios({
      url: `/api/posts/${sortType}`,
      method: "GET",
      withCredentials: true,
    }).then((posts) => {
      const normalizedData = normalize(posts.data, [post]);
      const idsofNewData = normalizedData.result;

      const newPostsArray = idsofNewData.map((id) => {
        return normalizedData.entities.posts[id];
      });
      const newPosts = normalizedData.entities.posts;
      dispatch({
        type: SORT_POSTS,
        idsofNewData,
        newPosts,
        sortType,
        newPostsArray,
        currentPosts,
        arrayOfCurrentPosts,
      });
      if (posts.data.status === 200) {
        return "fetched";
      }
    });
  };
}

export function setPostRange(before, after) {
  return { type: SET_POST, before, after };
}
export function fetchPosts(count, id, params) {
  return (dispatch, getState) => {
    const currentPosts = getState().posts.byId;

    dispatch(requestPosts());
    if (params) {
      if (!count) {
        return axios({
          url: `/api/posts/${params}`,
          method: "GET",
          withCredentials: true,
        }).then((posts) => {
          const normalizedData = normalize(posts.data, [post]);

          dispatch(receivePosts(normalizedData, params));
        });
      }
      if ("lastId" in id) {
        return axios({
          url: `/api/posts/${params}?page[size]=${count}&lastId=${id.lastId}`,
          method: "GET",
          withCredentials: true,
        }).then((posts) => {
          const normalizedData = normalize(posts.data, [post]);

          dispatch(receivePosts(normalizedData, params));
        });
      }
      if ("firstId" in id) {
        if (id === undefined) {
          return;
        }
        return axios({
          url: `/api/posts/${params}?page[size]=${count}&firstId=${id.firstId}`,
          method: "GET",
          withCredentials: true,
        }).then((posts) => {
          const normalizedData = normalize(posts.data, [post]);
          dispatch(receivePosts(normalizedData, params));
        });
      }
    }
    if (!count && !params) {
      return axios({
        url: `/api/posts`,
        method: "GET",
        withCredentials: true,
      }).then((posts) => {
        const normalizedData = normalize(posts.data, [post]);

        dispatch(receivePosts(normalizedData));
      });
    }
    if ("lastId" in id) {
      return axios({
        url: `/api/posts/?page[size]=${count}&lastId=${id.lastId}`,
        method: "GET",
        withCredentials: true,
      }).then((posts) => {
        const normalizedData = normalize(posts.data, [post]);

        dispatch(receivePosts(normalizedData));
      });
    }
    if ("firstId" in id) {
      if (id === undefined) {
        return;
      }
      return axios({
        url: `/api/posts?page[size]=${count}&firstId=${id.firstId}`,
        method: "GET",
        withCredentials: true,
      }).then((posts) => {
        const normalizedData = normalize(posts.data, [post]);
        dispatch(receivePosts(normalizedData));
      });
    }
  };
}
export function fetchSinglePost(id) {
  return (dispatch) => {
    dispatch(requestSinglePost());
    return axios({
      url: `/api/post/${id}`,
      method: "GET",
      withCredentials: true,
    }).then((post) => {
      dispatch(receiveSinglePost(post.data));
    });
  };
}
