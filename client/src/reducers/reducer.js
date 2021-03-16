import { combineReducers } from "redux";
import {
  CLEAR_ERROR,
  CURRENT_USER,
  DELETE_POST,
  EDIT_POST,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOG_OUT,
  NEW_COMMENT_SUCCESS,
  NEW_POST_REQUEST,
  NEW_POST_SUCCESS,
  NEW_REPLY_REQUEST,
  NEW_REPLY_SUCCESS,
  NEXT_PAGE,
  POST_CREATION_CHANGE_SUBMISSION_TYPE,
  PREV_PAGE,
  RECEIVE_POSTS,
  RECEIVE_SINGLE_POSTS,
  REFRESH_USER,
  REQUEST_POSTS,
  SET_POST,
  SET_POST_MODAL,
  SIGNUP_ERROR,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  CLEAR_LOGIN_MODAL,
  SORT_POSTS,
  SPLICED_POST,
  UNAUTHORIZED_ERROR,
  VOTE_CAST,
} from "../types";
function addComment(state, action) {
  const { id, savedComment, postId } = action;
  const comment = { ...savedComment };
  if (comment.parentId) {
    return {
      ...state,
    };
  }
  const post = state.byId[postId];
  return {
    ...state,
    byId: {
      ...state.byId,
      [postId]: {
        ...post,
        comments: [id, ...state.byId[postId].comments],
      },
    },
  };
}
function changePostPoint(state, action) {
  const { postId } = action;
  const { point } = action;
  const { currentVoteState } = action;

  const post = state.byId[postId];
  if (action.commentId) {
    return state;
  } else {
    if (currentVoteState === 1 && point === 1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [postId]: {
            ...post,
            voteState: 0,
            voteTotal: state.byId[postId].voteTotal - 1,
          },
        },
      };
    }
    if (currentVoteState === 0 && point === 1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [postId]: {
            ...post,
            voteState: 1,
            voteTotal: state.byId[postId].voteTotal + 1,
          },
        },
      };
    }
    if (currentVoteState === 1 && point === -1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [postId]: {
            ...post,
            voteState: -1,
            voteTotal: state.byId[postId].voteTotal - 2,
          },
        },
      };
    }
    if (currentVoteState === 0 && point === -1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [postId]: {
            ...post,
            voteState: -1,
            voteTotal: state.byId[postId].voteTotal - 1,
          },
        },
      };
    }
    if (currentVoteState === -1 && point === -1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [postId]: {
            ...post,
            voteState: 0,
            voteTotal: state.byId[postId].voteTotal + 1,
          },
        },
      };
    }
    if (currentVoteState === -1 && point === 1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [postId]: {
            ...post,
            voteState: 1,
            voteTotal: state.byId[postId].voteTotal + 2,
          },
        },
      };
    }
  }
}

function handlePostSubmission(state, action) {
  const { post, id } = action;
  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: post,
    },
    allIds: [...state.allIds, id],
    submitting: false,
    createdPosts: {
      ...state.createdPosts,
      [id]: post,
    },

    submitted: true,
    reRouteId: id,
  };
}

function editPostReduce(state, action) {
  const { postId, content } = action;
  const post = state.byId[postId];
  return {
    ...state,
    byId: {
      ...state.byId,
      [postId]: {
        ...post,
        content: content,
      },
    },
  };
}
function handlePreviousPage(state, action) {
  let newPosts = action.newPosts;
  let currentPosts = action.currentPosts;
  let idsOfNewPosts = action.idsofNewData;
  let idsOfCurrentPosts = Object.keys(action.currentPosts);
  let newPostsArray = action.newPostsArray;
  let currentPostsArray = action.arrayOfCurrentPosts;
  let temp = {};
  let temp2 = [];

  for (let i = 0; i < newPostsArray.length; i++) {
    if (idsOfCurrentPosts.includes(idsOfNewPosts[i])) {
      currentPosts[idsOfNewPosts[i]] = newPostsArray[i];
    } else {
      temp2.push(newPostsArray[i]);
    }
  }
  currentPostsArray = idsOfCurrentPosts.map((id) => {
    return currentPosts[id];
  });

  currentPostsArray = currentPostsArray.concat(temp2);

  for (let i = 0; i < currentPostsArray.length; i++) {
    temp[currentPostsArray[i]._id] = currentPostsArray[i];
  }

  const finalArrayOfIds = currentPostsArray.map((a) => {
    return a._id;
  });
  return {
    ...state,
    isFetching: false,
    byId: {
      ...temp,
    },
    allIds: [...finalArrayOfIds],
    status: "succeeded",
    firstId: newPostsArray[0]._id,
    lastId: newPostsArray[newPostsArray.length - 1]._id,
  };
}
function handleNextPage(state, action) {
  let newPosts = action.newPosts;
  let currentPosts = action.currentPosts;
  let idsOfNewPosts = action.idsofNewData;
  let idsofCurrentPosts = Object.keys(action.currentPosts);
  let newPostsArray = action.newPostsArray;
  let currentPostsArray = action.arrayOfCurrentPosts;
  let temp = {};
  let temp2 = [];
  let temp3 = [];
  for (let i = 0; i < newPostsArray.length; i++) {
    if (idsofCurrentPosts.includes(idsOfNewPosts[i])) {
      currentPosts[idsOfNewPosts[i]] = newPostsArray[i];
    } else {
      temp2.push(newPostsArray[i]);
    }
  }
  currentPostsArray = idsofCurrentPosts.map((id) => {
    return currentPosts[id];
  });
  currentPostsArray = currentPostsArray.concat(temp2);

  for (let i = 0; i < currentPostsArray.length; i++) {
    temp[currentPostsArray[i]._id] = currentPostsArray[i];
  }

  const finalArrayOfIds = currentPostsArray.map((a) => {
    return a._id;
  });
  return {
    ...state,
    isFetching: false,
    byId: {
      ...temp,
    },
    allIds: [...finalArrayOfIds],
    status: "succeeded",
    firstId: newPostsArray[0]._id,
    lastId: newPostsArray[newPostsArray.length - 1]._id,
  };
}

function handleSort(state, action) {
  let newPosts = action.newPosts;
  let currentPosts = action.currentPosts;
  let idsOfNewPosts = action.idsofNewData;
  let idsofCurrentPosts = Object.keys(action.currentPosts);
  let newPostsArray = action.newPostsArray;
  let currentPostsArray = action.arrayOfCurrentPosts;
  let temp = {};
  let temp2 = [];
  let temp3 = [];
  for (let i = 0; i < newPostsArray.length; i++) {
    if (idsofCurrentPosts.includes(idsOfNewPosts[i])) {
      currentPosts[idsOfNewPosts[i]] = newPostsArray[i];
    } else {
      temp2.push(newPostsArray[i]);
    }
  }
  currentPostsArray = idsofCurrentPosts.map((id) => {
    return currentPosts[id];
  });
  currentPostsArray = currentPostsArray.concat(temp2);

  for (let i = 0; i < currentPostsArray.length; i++) {
    temp[currentPostsArray[i]._id] = currentPostsArray[i];
  }

  const finalArrayOfIds = currentPostsArray.map((a) => {
    return a._id;
  });
  return {
    ...state,
    isFetching: false,
    byId: {
      ...temp,
    },
    allIds: [...finalArrayOfIds],
    status: "succeeded",
    firstId: newPostsArray[0]._id,
    lastId: newPostsArray[newPostsArray.length - 1]._id,
  };
}
function setListings(state, action) {
  if (action.sort) {
    return {
      ...state,
      sortOrder: action.sort,
      listingOrder: {
        ...state.listingOrder,

        [action.sort]: action.data.result,
      },
    };
  }
  if (!action.sort) {
    return {
      ...state,
      sortOrder: "default",
      listingOrder: {
        ...state.listingOrder,

        ["default"]: action.data.result,
      },
    };
  }
}
function nextPageListing(state, action) {
  let newPosts = action.newPosts;
  let currentPosts = action.currentPosts;
  let idsOfNewPosts = action.idsofNewData;
  let idsofNewData = Object.keys(action.currentPosts);
  let newPostsArray = action.newPostsArray;
  let currentPostsArray = action.arrayOfCurrentPosts;
  let temp = {};
  let currentPostsSorted = state.listingOrder[action.sort]
    ? [...state.listingOrder[action.sort]]
    : null;
  let currentPostsDefault = state.listingOrder.default
    ? [...state.listingOrder.default]
    : null;

  if (action.sort) {
    for (let i = 0; i < idsOfNewPosts.length; i++) {
      if (state.listingOrder[action.sort].includes(idsOfNewPosts[i])) {
        currentPosts[idsOfNewPosts[i]] = newPosts[idsOfNewPosts[i]];
      } else {
        currentPostsSorted.push(idsOfNewPosts[i]);
      }
    }
    return {
      ...state,
      listingOrder: {
        ...state.listingOrder,
        [action.sort]: [...currentPostsSorted],
      },
    };
  }
  if (!action.sort) {
    for (let i = 0; i < idsOfNewPosts.length; i++) {
      if (state.listingOrder.default.includes(idsOfNewPosts[i])) {
        currentPosts[idsOfNewPosts[i]] = newPosts[idsOfNewPosts[i]];
      } else {
        currentPostsDefault.push(idsOfNewPosts[i]);
      }
    }
    return {
      ...state,
      listingOrder: {
        ...state.listingOrder,
        ["default"]: [...currentPostsDefault],
      },
    };
  }
}

function prevPageListing(state, action) {
  let newPosts = action.newPosts;
  let currentPosts = action.currentPosts;
  let idsOfNewPosts = action.idsofNewData;
  let idsofNewData = Object.keys(action.currentPosts);
  let newPostsArray = action.newPostsArray;
  let currentPostsArray = action.arrayOfCurrentPosts;
  let temp = [];
  let currentPostsSorted = state.listingOrder[action.sort]
    ? [...state.listingOrder[action.sort]]
    : null;
  let currentPostsDefault = state.listingOrder.default
    ? [...state.listingOrder.default]
    : null;

  if (action.sort) {
    for (let i = 0; i < idsOfNewPosts.length; i++) {
      if (state.listingOrder[action.sort].includes(idsOfNewPosts[i])) {
        currentPosts[idsOfNewPosts[i]] = newPosts[idsOfNewPosts[i]];
      } else {
        temp.push(idsOfNewPosts[i]);
      }
    }
    currentPostsSorted = temp.concat(currentPostsSorted);
    return {
      ...state,
      listingOrder: {
        ...state.listingOrder,
        [action.sort]: [...currentPostsSorted],
      },
    };
  }
  if (!action.sort) {
    for (let i = 0; i < idsOfNewPosts.length; i++) {
      if (state.listingOrder.default.includes(idsOfNewPosts[i])) {
        currentPosts[idsOfNewPosts[i]] = newPosts[idsOfNewPosts[i]];
      } else {
        currentPostsDefault.push(idsOfNewPosts[i]);
      }
    }
    return {
      ...state,
      listingOrder: {
        ...state.listingOrder,
        ["default"]: [...currentPostsDefault],
      },
    };
  }
}
function listings(
  state = {
    sortOrder: "",
    listingOrder: {},
  },
  action
) {
  switch (action.type) {
    case SORT_POSTS:
      return Object.assign({}, state, {
        sortOrder: action.sortType,
        listingOrder: {
          ...state.listingOrder,
          [action.sortType]: action.idsofNewData,
        },
      });
    case PREV_PAGE:
      return prevPageListing(state, action);
    case NEXT_PAGE:
      return nextPageListing(state, action);
    case RECEIVE_POSTS:
      return setListings(state, action);
    default:
      return state;
  }
}
function receievePosts(state, action) {
  let index = action.arrayOfNewIds.indexOf(state.allIds);
  let temp = action.arrayOfNewIds;
  if (action.arrayOfNewIds.includes(action.data.result)) {
    temp.splice(index, 1);

    return temp;
  } else {
    return action.data.result;
  }
}
function posts(
  state = {
    isFetching: false,
    byId: {},
    allIds: [],
    submitted: false,
    err: null,
    createdPosts: {},
    submitting: false,
    reRouteId: null,
    status: "idle",
    firstId: "",
    lastId: "",
  },
  action
) {
  switch (action.type) {
    case SORT_POSTS:
      return handleSort(state, action);
    case PREV_PAGE:
      return handlePreviousPage(state, action);
    case NEXT_PAGE:
      return handleNextPage(state, action);
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        isFetching: true,
        status: "loading",
      });
    case SPLICED_POST:
      return Object.assign({}, state, {
        byId: action.newObj,
        allIds: action.splicedArray,
        createdPosts: {},
      });
    case RECEIVE_SINGLE_POSTS:
      return Object.assign({}, state, {
        byId: { ...state.byId, ...action.temp },
        allIds: [...state.allIds, action.id],
      });
    case RECEIVE_POSTS:
      return {
        ...state,
        isFetching: false,
        status: "succeeded",
        byId: {
          ...state.byId,
          ...action.data.entities.posts,
          ...state.createdPosts,
        },
        allIds: receievePosts(state, action),
        firstId: action.data.result[0],
        lastId: action.data.result[action.data.result.length - 1],
      };
    case VOTE_CAST:
      return changePostPoint(state, action);
    case DELETE_POST:
      return Object.assign({}, state, {});
    case NEW_COMMENT_SUCCESS:
      return addComment(state, action);
    case NEW_POST_REQUEST:
      return Object.assign({}, state, {
        submitted: false,
        submitting: true,
        reRouteId: "",
      });
    case EDIT_POST:
      return editPostReduce(state, action);
    case NEW_POST_SUCCESS:
      return handlePostSubmission(state, action);
    default:
      return state;
  }
}
function setPostModal(state, action) {
  const { post } = action;

  return {
    ...state,
    post,
  };
}
function currentModal(
  state = {
    post: {},
  },
  action
) {
  switch (action.type) {
    case SET_POST_MODAL:
      return setPostModal(state, action);
    case NEW_POST_SUCCESS:
      return Object.assign({}, state, {
        post: action.post,
      });
    default:
      return state;
  }
}
function commentIds(state, action) {
  let comments = action.data.entities.comments;
  let temp = [];
  if (!comments) {
    return [];
  }
  return Object.keys(comments);
}
function addCommentEntry(state, action) {
  const { id, savedComment } = action;

  const comment = { ...savedComment };

  if (comment.parentId) {
    const { parentId } = savedComment;
    const newId = state.byId[parentId];

    return {
      ...state,
      byId: {
        [id]: comment,
        ...state.byId,

        [parentId]: {
          ...state.byId[parentId],
          comments: [id, ...state.byId[parentId].comments],
        },
      },

      allId: [id, ...state.allId],
    };
  } else {
    return {
      ...state,
      byId: {
        ...state.byId,
        [id]: comment,
      },
      allId: [id, ...state.allId],
    };
  }
}
function changeCommentPoint(state, action) {
  if (action.commentId) {
    const { commentId } = action;
    const { point } = action;
    const { currentVoteState } = action;
    const comment = state.byId[commentId];
    if (currentVoteState === 1 && point === 1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [commentId]: {
            ...comment,
            voteState: 0,
            voteTotal: state.byId[commentId].voteTotal - 1,
          },
        },
      };
    }
    if (currentVoteState === 0 && point === 1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [commentId]: {
            ...comment,
            voteState: 1,
            voteTotal: state.byId[commentId].voteTotal + 1,
          },
        },
      };
    }
    if (currentVoteState === 1 && point === -1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [commentId]: {
            ...comment,
            voteState: -1,
            voteTotal: state.byId[commentId].voteTotal - 2,
          },
        },
      };
    }
    if (currentVoteState === 0 && point === -1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [commentId]: {
            ...comment,
            voteState: -1,
            voteTotal: state.byId[commentId].voteTotal - 1,
          },
        },
      };
    }
    if (currentVoteState === -1 && point === -1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [commentId]: {
            ...comment,
            voteState: 0,
            voteTotal: state.byId[commentId].voteTotal + 1,
          },
        },
      };
    }
    if (currentVoteState === -1 && point === 1) {
      return {
        ...state,
        byId: {
          ...state.byId,
          [commentId]: {
            ...comment,
            voteState: 1,
            voteTotal: state.byId[commentId].voteTotal + 2,
          },
        },
      };
    }
  } else {
    return state;
  }
}
function onRecievePosts(state = {}, action) {}
function comments(
  state = {
    byId: {},
    allId: [],
  },
  action
) {
  switch (action.type) {
    case RECEIVE_POSTS: {
      return Object.assign({}, state, {
        byId: action.data.entities.comments,
        allId: commentIds(state, action),
      });
    }

    case NEW_REPLY_SUCCESS:
      return Object.assign({}, state, {
        byId: { ...state.byId, ...action.temp },
        allId: [...state.allId, action.newid],
      });
    case VOTE_CAST:
      return changeCommentPoint(state, action);
    case NEW_COMMENT_SUCCESS:
      return addCommentEntry(state, action);
    case NEW_REPLY_REQUEST:
      return Object.assign({}, state, {});
    default:
      return state;
  }
}

function changeNewSubmissionType(
  state = {
    submissionType: "",
  },
  action
) {
  switch (action.type) {
    case POST_CREATION_CHANGE_SUBMISSION_TYPE:
      return Object.assign({}, state, {
        submissionType: action.postType,
      });
    default:
      return state;
  }
}
function pageNumber(
  state = {
    currentPage: 0,
    first_id: "",
    last_id: "",
  },
  action
) {
  switch (action.type) {
    case SET_POST:
      return Object.assign({}, state, {
        first_id: action.before,
        last_id: action.after,
      });
    case NEXT_PAGE:
      return Object.assign({}, state, {
        currentPage: state.currentPage + 1,
      });
    case PREV_PAGE:
      return Object.assign({}, state, {
        currentPage: state.currentPage - 1,
      });
    default:
      return state;
  }
}
function signup(
  state = {
    isSigningUp: false,
    isSignedUp: false,

    err: null,
    passwordError: null,
  },
  action
) {
  const { passwordError } = action;
  switch (action.type) {
    case SIGNUP_REQUEST:
      return Object.assign({}, state, {
        err: null,
        passwordError: null,
      });
    case SIGNUP_SUCCESS:
      return Object.assign({}, state, {
        isSignedUp: true,
        isSigningUp: false,
        err: null,
        passwordError: null,
      });
    case CLEAR_ERROR:
      return Object.assign({}, state, {
        err: null,
      });
    case SIGNUP_ERROR:
      return Object.assign({}, state, {
        err: action.error,
        passwordError,
      });
    default:
      return state;
  }
}
function login(
  state = {
    isLoggingIn: false,
    isLoggedIn: false,

    err: null,
  },
  action
) {
  switch (action.type) {
    case UNAUTHORIZED_ERROR:
      return Object.assign({}, state, {
        err: "Username or Password do not match",
      });
    case CLEAR_LOGIN_MODAL:
      return Object.assign({}, state, {
        err: null,
      });
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isLoggingIn: true,
        isLoggedIn: false,
      });
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isLoggingIn: false,
        isLoggedIn: true,
      });
    case LOG_OUT:
      return Object.assign({}, state, {
        isLoggingIn: false,
        isLoggingIn: false,
      });
    case LOGIN_ERROR:
      return Object.assign({}, state, {
        isLoggingIn: false,
        isLoggedIn: false,
      });
    case CURRENT_USER:
      return Object.assign({}, state, {
        isLoggedIn: true,
        currentUser: action.user,
      });
    default:
      return state;
  }
}
function currentUser(
  state = {
    username: "",
    _id: "",

    err: null,
  },
  action
) {
  switch (action.type) {
    case LOG_OUT:
      return Object.assign({}, state, {
        username: "",
        _id: "",
      });
    case REFRESH_USER:
      return Object.assign({}, state, {
        username: action.userInfo.username,
        _id: action.userInfo._id,
      });
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        username: action.username,
        _id: action.id,
      });
    case CURRENT_USER:
      return Object.assign({}, state, {
        isLoggedIn: true,
        username: action.user.username,
        _id: action.user._id,
      });
    default:
      return state;
  }
}
const rootReducer = combineReducers({
  comments,
  currentModal,
  changeNewSubmissionType,
  posts,
  pageNumber,
  login,
  signup,
  currentUser,
  listings,
});

export default rootReducer;
