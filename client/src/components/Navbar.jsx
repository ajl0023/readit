import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { fetchPosts } from "../actions/postActions";
import { logOut } from "../actions/userActions";
import hamburger from "../images/hamburger.svg";
import searchicon from "../images/magnifying-glass.svg";
import defaultPic from "../images/reddit-default.svg";
import triangle from "../images/Triangle.svg";
function Navbar(props) {
  const [dropdown, setDropDown] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [authDropDown, setAuthDropDown] = useState(false);
  const [searchContent, setSearchContent] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const currentUser = useSelector((state) => {
    return state.currentUser;
  });
  const loggedIn = useSelector((state) => {
    return state.login.isLoggedIn;
  });
  const currentModal = useSelector((state) => {
    return state.currentModal;
  });
  const dispatch = useDispatch();
  const allIds = useSelector((state) => {
    return state.posts.allIds;
  });
  const post = useSelector((state) => {
    return state.posts.byId;
  });
  let flattened = allIds.map((x) => {
    return post[x];
  });
  const handleDropDown = () => {
    setDropDown(!dropdown);
  };
  let value;
  const handleSearchContent = async (e) => {
    setSearchInput(e.target.value);
    value = e.target.value;
    let trimmed = await value.trimStart();
    let filtered = await flattened.filter((post) => {
      const regex = new RegExp(`^` + trimmed, "gi");
      return regex.test(post.title);
    });
    setSearchContent(filtered);
  };
  const handleCloseSearch = () => {
    setSearchActive(!searchActive);
  };
  const handleLogout = () => {
    dispatch(logOut()).then((data) => {
      if (data.status === 200) {
        window.location.reload();
      }
    });
  };
  let re = /^\s+(?=[a-z0-9])|^[a-z0-9]/g;
  const closeSearch = () => {
    if (searchActive) {
      setSearchActive(false);
    }
  };
  const handleLogoClick = () => {
    document.body.style.overflow = "";
    if (currentModal.post.newPost) {
    }
    if (props.match.path === "/") {
      dispatch(fetchPosts());
    }
  };
  useEffect(() => {
    document.title = "Readit";
    document.body.addEventListener("click", closeSearch);
    return () => {
      document.body.removeEventListener("click", closeSearch);
    };
  }, [closeSearch]);
  return (
    <>
      <div className="navbar-wrapper">
        <div className="navbar-container">
          <div className="navbar-content">
            <li>
              <Link
                to={{ pathname: "/" }}
                replace={props.history.location.pathname === "/" ? true : false}
                onClick={handleLogoClick}
                className="logo"
              >
                readit
              </Link>
            </li>
            <div className={"search-bar-container"}>
              <input
                onClick={handleCloseSearch}
                onChange={(e) => handleSearchContent(e)}
                className="search-bar"
                placeholder="Search"
                type="text"
              />
              <span className="search-icon">
                <img src={searchicon} alt="" />
              </span>
              <div
                onClick={(e) => handleCloseSearch(e)}
                className="search-dropdown-container"
              >
                {re.test(searchInput)
                  ? searchContent.map((post) => {
                      return (
                        <>
                          {" "}
                          <div
                            className={`search-dropdown-content ${
                              !searchActive ? `hide-search` : null
                            } `}
                            key={post._id}
                          >
                            <Link
                              className={`search-content-item`}
                              to={`/post/${post._id}`}
                            >
                              {post.title}
                            </Link>
                          </div>
                        </>
                      );
                    })
                  : null}
              </div>
            </div>
            {!localStorage.getItem("accessToken") && !loggedIn ? (
              <>
                <div className="auth-button-container-navbar">
                  <button onClick={props.handleShowLogin}>log in</button>
                  <button onClick={props.handleShowSignup}>sign up</button>
                </div>
                <div className="hamburger-container">
                  <div className="hamburger-button-container">
                    <input
                      type="checkbox"
                      id="trigger"
                      className={"burger-input"}
                    />
                    <label htmlFor="trigger" className={"burger-label"}>
                      <div className={"main-trigger-icon-container"}>
                        <span className={"main-trigger-icon"}></span>
                      </div>
                    </label>
                    <div className="hamburger-item-container">
                      <li className="hamburger-item">
                        {" "}
                        <button
                          className="hamburger-item-button"
                          onClick={props.handleShowLogin}
                        >
                          log in
                        </button>
                      </li>
                      <li className="hamburger-item">
                        <button
                          className="hamburger-item-button"
                          onClick={props.handleShowSignup}
                        >
                          sign up
                        </button>
                      </li>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="profile-wrapper">
                <button
                  onClick={() => handleDropDown()}
                  className="navbar-profile-container"
                >
                  <div className="navbar-logo-text">
                    <img
                      className="default-profile-image"
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                      src={defaultPic}
                      alt=""
                    />
                    <p className="navbar-profile-username">
                      {currentUser.username}
                    </p>
                  </div>
                  <img
                    className="navbar-profile-triangle"
                    src={triangle}
                    alt=""
                  />
                </button>
                {dropdown ? (
                  <div className="navbar-dropdown-container">
                    <ul className="navbar-dropdown">
                      <li>
                        <button
                          onClick={handleLogout}
                          className="navbar-dropdown-options"
                        >
                          Logout
                        </button>
                      </li>
                      <li></li>
                      <li></li>
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
}
export default withRouter(Navbar);
