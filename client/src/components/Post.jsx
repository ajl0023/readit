import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deletePost } from "../actions/postActions";
import { ReactComponent as Trash } from "../images/delete.svg";
import { ReactComponent as DownArrow } from "../images/down-arrow.svg";
import { ReactComponent as UpArrow } from "../images/up-arrow.svg";

const Post = ({ post, pastParams, firstPost }) => {
  const [deleteButton, setDelete] = useState(false);
  const [active, setActive] = useState(true);
  const dispatch = useDispatch();
  const postStore = useSelector((state) => {
    return state.posts.allIds;
  });
  const currentUser = useSelector((state) => state.currentUser._id);
  const postStatus = useSelector((state) => state.posts.status);
  const handleDelete = () => {
    setDelete(!deleteButton);
  };
  const confirmedDelete = (postId) => {
    dispatch(deletePost(postId));
    setActive(false);
  };
  if (post === "loading") {
    return (
      <div className="card-container">
        <div className="card-content-container"></div>
      </div>
    );
  }
  if (!postStore[0]) {
    return <div></div>;
  }
  return (
    <>
      {active ? (
        <div key={post._id} className="card-container">
          {postStatus === "loading" ? (
            <div></div>
          ) : (
            <div className="card-content-container">
              <p className="card-author">u/{post.author.username}</p>
              <h4 className="card-title">
                <Link
                  to={{
                    pathname: `/post/${post._id}`,
                    state: {
                      modal: true,
                      homePosts: {
                        params: pastParams.params,
                        firstPost: firstPost._id,
                      },
                    },
                  }}
                >
                  {post.title}
                </Link>
              </h4>
              <div className="vote-container">
                <li>
                  <UpArrow
                    className={post.voteState === 1 ? `home-vote-color` : ``}
                    alt=""
                  />
                </li>
                <li>{post.voteTotal}</li>

                <li>
                  <DownArrow
                    className={post.voteState === -1 ? `home-vote-color` : ``}
                    alt=""
                  />
                </li>
              </div>
            </div>
          )}

          {currentUser === post.author._id ? (
            <div className="edit-del-container">
              <div className="edit-del-content">
                {deleteButton ? (
                  <div className="delete-confirm-container">
                    <div>
                      <p className="delete-confirm">Delete?</p>
                    </div>
                    <li
                      onClick={() => confirmedDelete(post._id)}
                      className="delete-button-yes"
                    >
                      Yes
                    </li>
                    <li className="delete-button-slash">/</li>
                    <li className="delete-button-yes">No</li>
                  </div>
                ) : null}
                <button onClick={handleDelete} className="delete-button">
                  <Trash className="del-svg" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default Post;
