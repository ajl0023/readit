import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { changePostSubmissionType, submitPost } from "../actions/postActions";
import { loggedIn, loginStatus } from "../actions/userActions";

const NewPost = () => {
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  let query = useQuery();
  let newQuery = query.get("media");
  let newQuery2 = query.get("link");
  let submissionType = useSelector((state) => {
    return state.changeNewSubmissionType.submissionType;
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imagedata, setImage] = useState("");
  const submitCheck = useSelector((state) => {
    return state.posts.submitted;
  });
  const fetchingLogin = useSelector((state) => state.login.fetching);
  const loggedInStatus = useSelector((state) => state.login.isLoggedIn);

  const reRouteId = useSelector((state) => {
    return state.posts.reRouteId;
  });
  useEffect(() => {
 
  }, []);
  useEffect(() => {
    if (newQuery) {
      submissionType = "media";
    } else if (newQuery2) {
      submissionType = "link";
    }
    if (submitCheck) {
      history.push(`/post/${reRouteId}`);
    }
  }, [submitCheck]);
  if (fetchingLogin) {
    return <div></div>;
  }
  const uploadForm = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", title);
    data.append("content", text);
    data.append("file", imagedata);

    dispatch(submitPost(data));
  };

  const handleFormType = () => {
    window.history.replaceState("page2", "Title", "/new-post");

    dispatch(changePostSubmissionType("post"));
  };
  const handleImageType = () => {
    dispatch(changePostSubmissionType("media"));
    window.history.replaceState("page2", "Title", "/new-post");
  };
  const handleLinkType = () => {
    dispatch(changePostSubmissionType("link"));
    window.history.replaceState("page2", "Title", "/new-post");
  };
  return (
    <div className="newpost-wrapper">
      <div className="newpost-container">
        <p className="newpost-title">Create a post</p>
        <div className="newpost-template">
          <div className="newpost-options">
            <button
              className={
                submissionType === "post"
                  ? `submit-type-button ${`selectedType`}`
                  : `submit-type-button`
              }
              onClick={handleFormType}
            >
              Post
            </button>
            <button
              className={
                submissionType === "media"
                  ? `submit-type-button ${`selectedType`}`
                  : `submit-type-button`
              }
              onClick={handleImageType}
            >
              Images {"&"} Video
            </button>
            <button
              className={
                submissionType === "link"
                  ? `submit-type-button ${`selectedType`}`
                  : `submit-type-button`
              }
              onClick={handleLinkType}
            >
              Link
            </button>
          </div>
          <form action="">
            <div className="newpost-title-container">
              <input
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Title"
                className="newpost-title"
                type="text"
              />
            </div>

            <div className="newpost-entry-container">
              {submissionType === "media" ? (
                <div className="upload-input-container">
                  <input
                    onChange={(e) => {
                      setImage(e.target.files[0]);
                    }}
                    className="upload-input"
                    type="file"
                    name=""
                    id="file-input"
                  />
                </div>
              ) : (
                <textarea
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                  placeholder="Text(optional)"
                  className="newpost-entry"
                  name=""
                  id=""
                  cols="30"
                  rows="10"
                ></textarea>
              )}
              <div className="submission-button-container">
                <button
                  type="submit"
                  onClick={(e) => uploadForm(e)}
                  className="submission-buttons"
                >
                  Post
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
