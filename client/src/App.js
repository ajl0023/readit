import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
} from "react-router-dom";
import { nextPage, prevPage } from "./actions/postActions";
import { clearLoginModal, loggedIn } from "./actions/userActions";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import NewPost from "./components/NewPost";
import PostModal from "./components/PostModal";
import Signup from "./components/Signup";
import "./styles/myApp.scss";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function App(props) {
  let queryParams = props.location.search;
  let after = new URLSearchParams(queryParams).get("after");
  let before = new URLSearchParams(queryParams).get("before");
  const [showLogin, setLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [urlAfter, setUrlAfter] = useState("");
  const [urlBefore, setUrlBefore] = useState("");
  const loggedInStatus = useSelector((state) => state.login.isLoggedIn);
  const signedUpStatus = useSelector((state) => state.signup.isSignedUp);
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

  useEffect(() => {
    dispatch(loggedIn());
    if (loggedInStatus) {
      setLogin(false);
    }
    if (!props.location.state) {
      setUrlAfter(after);
      setUrlBefore(before);
    }

    if (signedUpStatus && !loggedInStatus) {
      setShowSignup(false);
      setLogin(true);
    }
  }, [loggedInStatus, signedUpStatus]);

  const handleShowLogin = () => {
    setLogin(!showLogin);
  };
  const handleShowSignup = () => {
    setShowSignup(!showSignup);
  };
  const closeModal = () => {
    dispatch(clearLoginModal());
    setLogin(false);
    setShowSignup(false);
  };

  const handleShowNextPage = (lastId2, sort) => {
    if (sort) {
      dispatch(nextPage(10, lastId2, sort)).then((status) => {
        if (status === "completed") {
          window.scrollTo(0, 0);
        }
      });
    }
    if (!sort) {
      dispatch(nextPage(10, lastId2)).then((status) => {
        if (status === "completed") {
          window.scrollTo(0, 0);
        }
      });
    }
  };
  const handlePrevPage = (firstId2, sort) => {
    if (sort) {
      dispatch(prevPage(10, firstId2, sort)).then((status) => {
        if (status === "completed") {
          window.scrollTo(0, 0);
        }
      });
    }
    if (!sort) {
      dispatch(prevPage(10, firstId2)).then((status) => {
        if (status === "completed") {
          window.scrollTo(0, 0);
        }
      });
    }
  };
  return (
    <div className={"app-wrapper"}>
      {showLogin ? <Login close={closeModal} /> : null}
      {showSignup ? <Signup close={closeModal} /> : null}
      <Navbar
        handleShowLogin={handleShowLogin}
        handleShowSignup={handleShowSignup}
      />

      <Route
        exact
        path="/post/:id"
        render={(props) => {
          return (
            <PostModal
              handleShowLogin={handleShowLogin}
              handleShowSignup={handleShowSignup}
              {...props}
            />
          );
        }}
      />

      <Switch>
        <Route
          exact
          path="/new-post"
          render={(props) => {
            return <NewPost {...props} />;
          }}
        >
          {!loggedInStatus ? <Redirect to="/" /> : null}
        </Route>

        <Route
          path="/:sort?"
          render={(props2) => {
            return (
              <Home
                handleShowLogin={handleShowLogin}
                handleShowSignup={handleShowSignup}
                handleShowNextPage={handleShowNextPage}
                handlePrevPage={handlePrevPage}
                after={urlAfter}
                before={urlBefore}
                {...props2}
                test={props.posts}
              />
            );
          }}
          showLogin={showLogin}
          showSignup={showSignup}
        />
      </Switch>
    </div>
  );
}
function mapStateToProps(state, ownProps) {
  let loggedInStatus = state.login.isLoggedIn;
  return {
    loggedIn: loggedInStatus,
  };
}
export default connect(mapStateToProps)(App);
