import React, { useState, useEffect } from "react";
import { signup, signupRequest } from "../actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { CLEAR_ERROR, SIGNUP_REQUEST } from "../types";
import { Redirect } from "react-router-dom";
import Login from "./Login";
const Signup = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [editActive, setEditActive] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => {
    return state.login.isLoggedIn;
  });
  const error = useSelector((state) => {
    return state.signup.err;
  });
  const passwordError = useSelector((state) => {
    return state.signup.passwordError;
  });
  const handleSignup = () => {
    dispatch(signup(username, password, passwordConfirm)).then((res) => {
      if (res === "signup") {
        <Redirect to={Login}></Redirect>;
      }
    });
  };
  const handleError = () => {
    dispatch({ type: CLEAR_ERROR });
  };
  if (user) {
    window.location.reload();
  }
  useEffect(() => {
    dispatch(signupRequest());
  }, []);
  return (
    <div className="modal-wrapper">
      <div className="card-modal">
        <div className="login-modal-title-exit-container">
          <p className="login-modal-title">Sign up</p>
          <button onClick={props.close} className="login-cancel-button">
            X
          </button>
        </div>
        <div className="login-input-container">
          <input
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            onClick={handleError}
            className="login-input"
            placeholder="username"
            type="text"
          />
          <p className={`signup-error`}>{error}</p>
          <input
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="login-input"
            placeholder="password"
            type="password"
          />
          <p className={`signup-error`}>{passwordError}</p>
          <input
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
            }}
            className="login-input"
            placeholder="Confirm your password"
            type="password"
          />

          <button onClick={handleSignup} className="login-button">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
