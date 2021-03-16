import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  fetchPosts,
  newPostSubmissionType,
  sortBy,
  submitPostAttempt,
} from "../actions/postActions";
import imagePost from "../images/image-placeholder.svg";
import linkPost from "../images/link-post.svg";
import defaultPic from "../images/reddit-default.svg";
import Post from "./Post";
import Signup from "./Signup";

const Home = (props) => {
  const dispatch = useDispatch();
  const [firstIdPost, setFirstId] = useState("");
  const [lastIdPost, setLastId] = useState("");
  const allIds = useSelector((state) => {
    return state.posts.allIds;
  });
  const post = useSelector((state) => {
    return state.posts.byId;
  });
  let flattened = allIds.map((x) => {
    return post[x];
  });
  const loggedIn = useSelector((state) => state.login.isLoggedIn);
  const postStatus = useSelector((state) => state.posts.status);
  const params = useParams();
  const listingOrder = useSelector((state) => state.listings.listingOrder.hot);
  let queryParams = props.history.location.search;
  let count = new URLSearchParams(queryParams).get("count");
  let after = new URLSearchParams(queryParams).get("after");
  let before = new URLSearchParams(queryParams).get("before");

  useEffect(() => {
    let temp = [];
    document.body.style.overflow = "";
    for (let i = 0; i < 10; i++) {
      temp.push(flattened[i]);
    }
    if (params.sort === "post") {
      dispatch(fetchPosts());
    } else {
      if (params.sort) {
        if (count && after) {
          const lastId = { lastId: after };
          dispatch(fetchPosts(count, lastId, params.sort));
        }
        if (!count && !after && !before && params.sort) {
          dispatch(fetchPosts(null, null, params.sort));
        }
        if (count && before) {
          const firstId = { firstId: before };
          dispatch(fetchPosts(count, firstId, params.sort));
        }
      }

      if (!params.sort) {
        if (count && after) {
          const lastId = { lastId: after };

          dispatch(fetchPosts(count, lastId));
        }

        if (count && before) {
          const firstId = { firstId: before };
          dispatch(fetchPosts(count, firstId));
        }

        if (!count && !after && !before) {
          dispatch(fetchPosts());
        }
      }
    }
  }, []);
  if (postStatus === "idle") {
    return <div></div>;
  }
  const handleTextPost = () => {
    if (!loggedIn) {
      props.handleShowLogin();
    }
    dispatch(newPostSubmissionType("post"));
    dispatch(submitPostAttempt());
  };
  const handleImagePost = () => {
    if (!loggedIn) {
      props.handleShowLogin();
    }
    dispatch(newPostSubmissionType("media"));
    dispatch(submitPostAttempt());
  };
  const handleLinkPost = () => {
    if (!loggedIn) {
      props.handleShowLogin();
    }
    dispatch(newPostSubmissionType("link"));
    dispatch(submitPostAttempt());
  };

  const handleSort = (sortType) => {
    dispatch(sortBy(sortType)).then((res) => {});
  };

  let check;
  let lastId;
  let firstId;
  let filteredPosts;
  try {
    filteredPosts = props.posts.filter((posts) => {
      if (posts !== undefined) {
        return posts;
      }
    });
    firstId = props.posts[0]._id;
    lastId = filteredPosts[filteredPosts.length - 1]._id;
  } catch (err) {}

  return (
    <>
      <div className="home-wrapper">
        {props.showSignup ? <Signup /> : null}
        <div className="new-post-container">
          <Link to="">
            <img className="new-post-profile-image" src={defaultPic} alt="" />
          </Link>
          <Link
            onClick={handleTextPost}
            to={loggedIn ? "/new-post" : ""}
            className="new-post-input-container"
          >
            <input
              placeholder="Create Post"
              className="new-post-input"
              type="text"
            />
          </Link>
          <Link
            onClick={handleImagePost}
            to={loggedIn ? "/new-post?media=true" : ""}
          >
            <img className="post-option" src={imagePost} alt="" />
          </Link>
          <Link
            onClick={handleLinkPost}
            to={loggedIn ? "/new-post?link=true" : ""}
          >
            <img className="post-option" src={linkPost} alt="" />
          </Link>
        </div>

        <div className="categories-container">
          <Link to="/hot" onClick={() => handleSort("hot")}>
            Hot
          </Link>
          <Link to="/new" onClick={() => handleSort("new")}>
            New
          </Link>
          <Link to="/top" onClick={() => handleSort("top")}>
            Top
          </Link>
        </div>
        {!props.posts || props.posts.length === 0 || !props.posts[0] ? (
          <div></div>
        ) : (
          <>
            <>
              {props.posts.map((post) => {
                if (post) {
                  return (
                    <Post
                      firstPost={props.posts[0]}
                      pastParams={props.match}
                      history={props}
                      key={post._id}
                      post={post}
                    />
                  );
                }
              })}
            </>
            {post.length >= 10 ? (
              <div className="page-set-container">
                {props.posts[0].page === 1 || !count ? null : (
                  <Link
                    to={{
                      pathname: props.location.pathname,
                      search: "?" + `count=10&before=${firstId}`,
                    }}
                    onClick={() => props.handlePrevPage(firstId, params.sort)}
                  >
                    Prev
                  </Link>
                )}
                {props.posts[0].page === "last" ? null : (
                  <Link
                    to={{
                      pathname: props.location.pathname,
                      search: "?" + `count=10&after=${lastId}`,
                    }}
                    onClick={() =>
                      props.handleShowNextPage(lastId, params.sort)
                    }
                  >
                    Next
                  </Link>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
};
function mapStateToProps(state, ownProps) {
  const allIds = state.posts.allIds;
  const post = state.posts.byId;
  let firstId;
  let sortedByHot = [];
  let sortedByTop = [];
  let sortedByNew = [];
  let sortedByDefault = [];
  let lastId;
  let queryParams = ownProps.location.search;
  let after = new URLSearchParams(queryParams).get("after");
  let before = new URLSearchParams(queryParams).get("before");
  let indexofFirst;
  let indexOfLast;

  if (state.listings.listingOrder.hot && state.listings.sortOrder === "hot") {
    firstId = before;
    lastId = after;
    sortedByHot = state.listings.listingOrder.hot;
    indexofFirst = state.listings.listingOrder.hot.indexOf(firstId);
    indexOfLast = state.listings.listingOrder.hot.indexOf(lastId);
  }
  if (
    state.listings.listingOrder.default &&
    state.listings.sortOrder === "default"
  ) {
    firstId = before;
    lastId = after;
    sortedByDefault = state.listings.listingOrder.default;
    indexofFirst = state.listings.listingOrder.default.indexOf(firstId);
    indexOfLast = state.listings.listingOrder.default.indexOf(lastId);
  }
  if (state.listings.listingOrder.top && state.listings.sortOrder === "top") {
    firstId = before;
    lastId = after;
    sortedByTop = state.listings.listingOrder.top;
    indexofFirst = state.listings.listingOrder.top.indexOf(firstId);
    indexOfLast = state.listings.listingOrder.top.indexOf(lastId);
  }
  if (state.listings.listingOrder.new && state.listings.sortOrder === "new") {
    firstId = before;
    lastId = after;
    sortedByNew = state.listings.listingOrder.new;
    indexofFirst = state.listings.listingOrder.new.indexOf(firstId);
    indexOfLast = state.listings.listingOrder.new.indexOf(lastId);
  }
  let flattened = allIds.map((x) => {
    return post[x];
  });

  let currentPosts = state.posts.byId;

  let test;
  if (
    ownProps.match.params.sort === "default" &&
    state.listings.listingOrder.default
  ) {
    if (!after && !before) {
      sortedByDefault = sortedByDefault.slice(0, 10);
      sortedByDefault = sortedByDefault.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByDefault,
      };
    }
    if (after) {
      sortedByDefault = sortedByDefault.slice(
        indexOfLast + 1,
        indexOfLast + 11
      );
      sortedByDefault = sortedByDefault.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByDefault,
      };
    }
    if (before && sortedByDefault.length >= 10) {
      sortedByDefault = sortedByDefault.slice(indexofFirst - 10, indexofFirst);

      sortedByDefault = sortedByDefault.map((id) => {
        return state.posts.byId[id];
      });

      return {
        posts: sortedByDefault,
      };
    }
    if (before && sortedByDefault.length <= 10) {
      sortedByDefault = sortedByDefault.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByDefault,
      };
    }
  }
  if (ownProps.match.params.sort === "hot" && state.listings.listingOrder.hot) {
    if (!after && !before) {
      sortedByHot = sortedByHot.slice(0, 10);
      sortedByHot = sortedByHot.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByHot,
      };
    }
    if (after) {
      sortedByHot = sortedByHot.slice(indexOfLast + 1, indexOfLast + 11);
      sortedByHot = sortedByHot.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByHot,
      };
    }
    if (before && sortedByHot.length >= 10) {
      sortedByHot = sortedByHot.slice(indexofFirst - 10, indexofFirst);

      sortedByHot = sortedByHot.map((id) => {
        return state.posts.byId[id];
      });

      return {
        posts: sortedByHot,
      };
    }
    if (before && sortedByHot.length <= 10) {
      sortedByHot = sortedByHot.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByHot,
      };
    }
  }
  if (ownProps.match.params.sort === "top" && state.listings.listingOrder.top) {
    if (!after && !before) {
      sortedByTop = sortedByTop.slice(0, 10);
      sortedByTop = sortedByTop.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByTop,
      };
    }
    if (after && sortedByTop.length > 10) {
      sortedByTop = sortedByTop.slice(indexOfLast + 1, indexOfLast + 11);
      sortedByTop = sortedByTop.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByTop,
      };
    }

    if (after && sortedByTop.length <= 10) {
      sortedByTop = sortedByTop.map((id) => {
        return state.posts.byId[id];
      });

      return {
        posts: sortedByTop,
      };
    }
    if (before && sortedByTop.length > 10) {
      sortedByTop = sortedByTop.slice(indexofFirst - 10, indexofFirst);

      sortedByTop = sortedByTop.map((id) => {
        return state.posts.byId[id];
      });

      return {
        posts: sortedByTop,
      };
    }
    if (before && sortedByTop.length <= 10) {
      sortedByTop = sortedByTop.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByTop,
      };
    }
  }
  if (ownProps.match.params.sort === "new" && state.listings.listingOrder.new) {
    if (!after && !before) {
      sortedByNew = sortedByNew.slice(0, 10);
      sortedByNew = sortedByNew.map((id) => {
        return state.posts.byId[id];
      });

      return {
        posts: sortedByNew,
      };
    }
    if (after && sortedByNew.length > 10) {
      sortedByNew = sortedByNew.slice(indexOfLast + 1, indexOfLast + 11);
      sortedByNew = sortedByNew.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByNew,
      };
    }

    if (after && sortedByNew.length <= 10) {
      sortedByNew = sortedByNew.map((id) => {
        return state.posts.byId[id];
      });

      return {
        posts: sortedByNew,
      };
    }
    if (before && sortedByNew.length > 10) {
      sortedByNew = sortedByNew.slice(indexofFirst - 10, indexofFirst);

      sortedByNew = sortedByNew.map((id) => {
        return state.posts.byId[id];
      });

      return {
        posts: sortedByNew,
      };
    }
    if (before && sortedByNew.length <= 10) {
      sortedByNew = sortedByNew.map((id) => {
        return state.posts.byId[id];
      });
      return {
        posts: sortedByNew,
      };
    }
  }
  if (
    ownProps.match.isExact &&
    !ownProps.match.params.sort &&
    state.listings.listingOrder.default
  ) {
    let sortedByDefault = state.listings.listingOrder.default.map((id) => {
      return state.posts.byId[id];
    });
    if (after) {
      indexOfLast = allIds.indexOf(after);

      test = sortedByDefault.slice(indexOfLast + 1, indexOfLast + 11);
      return {
        allIds: allIds,
        allPosts: flattened,
        firstId: firstId && firstId._id,
        lastId: lastId && lastId._id,
        query: ownProps.location.search,
        posts: test,
      };
    }
    if (before) {
      indexofFirst = allIds.indexOf(before);
      test = sortedByDefault.slice(indexofFirst - 10, indexofFirst);
      return {
        allIds: allIds,
        allPosts: flattened,
        firstId: firstId && firstId._id,
        lastId: lastId && lastId._id,
        query: ownProps.location.search,
        posts: test,
      };
    }
    if (!ownProps.after && !ownProps.before) {
      let temp = [];
      for (let i = 0; i < sortedByDefault.length; i++) {
        temp.push(sortedByDefault[i]);
      }
      return {
        allPosts: flattened,
        allIds: allIds,
        firstId: firstId && firstId._id,
        lastId: lastId && lastId._id,
        posts: temp,
      };
    }
  }
  let sortedDefault = state.listings.listingOrder.default
    ? state.listings.listingOrder.default.map((id) => {
        return state.posts.byId[id];
      })
    : [];
  let sortedHot = state.listings.listingOrder.hot
    ? state.listings.listingOrder.hot.map((id) => {
        return state.posts.byId[id];
      })
    : [];
  let sortedTop = state.listings.listingOrder.top
    ? state.listings.listingOrder.top.map((id) => {
        return state.posts.byId[id];
      })
    : [];
  let sortedNew = state.listings.listingOrder.new
    ? state.listings.listingOrder.new.map((id) => {
        return state.posts.byId[id];
      })
    : [];

  if (ownProps.location.state) {
    if (
      !ownProps.match.isExact &&
      !ownProps.location.state.homePosts.params.sort
    ) {
      indexofFirst = sortedByDefault.indexOf(
        ownProps.location.state.homePosts.firstPost
      );
      test = sortedDefault.slice(indexofFirst, indexofFirst + 10);

      return {
        posts: test,
      };
    }
    if (
      !ownProps.match.isExact &&
      ownProps.location.state.homePosts.params.sort === "hot"
    ) {
      indexofFirst = sortedByHot.indexOf(
        ownProps.location.state.homePosts.firstPost
      );
      test = sortedHot.slice(indexofFirst, indexofFirst + 10);

      return {
        posts: test,
      };
    }
    if (
      !ownProps.match.isExact &&
      ownProps.location.state.homePosts.params.sort === "new"
    ) {
      indexofFirst = sortedByNew.indexOf(
        ownProps.location.state.homePosts.firstPost
      );
      test = sortedNew.slice(indexofFirst, indexofFirst + 10);

      return {
        posts: test,
      };
    }
    if (
      !ownProps.match.isExact &&
      ownProps.location.state.homePosts.params.sort === "top"
    ) {
      indexofFirst = sortedByTop.indexOf(
        ownProps.location.state.homePosts.firstPost
      );
      test = sortedTop.slice(indexofFirst, indexofFirst + 10);

      return {
        posts: test,
      };
    }
  }
}
export default connect(mapStateToProps)(Home);
