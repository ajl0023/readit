import axios from "axios";
import {
  CURRENT_USER,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOG_OUT,
  REFRESH_USER,
  SIGNUP_ERROR,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  UNAUTHORIZED_ERROR,
  CLEAR_LOGIN_MODAL,
} from "../types";

axios.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

function loginRequest() {
  return {
    type: LOGIN_REQUEST,
  };
}
function loginError(err) {
  return (dispatch) => {
    axios({
      withCredentials: true,
      method: "POST",

      url: "/api/logout",
    });
    dispatch({ type: LOGIN_ERROR, err });
  };
}
function loginSuccess(username, id) {
  return (dispatch) => {
    dispatch({
      type: LOGIN_SUCCESS,
      username,
      id,
    });
    Promise.resolve("success");
  };
}
export function logOut() {
  return (dispatch) => {
    dispatch({ type: LOG_OUT });
    return axios({
      url: "/api/logout",
      withCredentials: true,
      method: "POST",
    }).then((res) => {
      if (res.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("state");
        return "success";
      }
    });
  };
}
function currentUser(user) {
  return {
    type: CURRENT_USER,
    user,
  };
}
function unauthorized(err) {
  return {
    type: UNAUTHORIZED_ERROR,
  };
}
export function login(username, password) {
  return (dispatch) => {
    dispatch(loginRequest());

    return axios({
      withCredentials: true,
      method: "POST",
      data: {
        username: username,
        password: password,
      },

      url: "/api/login",
    })
      .then((res) => {
        if (res.status === 200) {
          dispatch(loginSuccess(res.data.username, res.data._id));
          let token = res.data.jwt_token;
          return token;
        }
      })
      .then((token) => {
        localStorage.setItem("accessToken", token);
        return "login";
      })
      .catch(() => {
        dispatch(unauthorized());
      });
  };
}
export function clearLoginModal() {
  return {
    type: CLEAR_LOGIN_MODAL,
  };
}
export function loggedIn() {
  return (dispatch, getState) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }
    return axios({
      withCredentials: true,
      method: "GET",
      url: "/api/logged-in",
    })
      .then((res) => {
        if (res.status === 200) {
          dispatch(
            currentUser({
              username: res.data.username,
              _id: res.data._id,
            })
          );
        }

        if (res.data.error === "jwt expired") {
          axios({
            url: "/api/refresh",
            withCredentials: true,
            method: "POST",
          }).then((res) => {
            if (res.status === 200) {
              let token = res.data.jwt_token;
              dispatch({ type: REFRESH_USER, userInfo: res.data });
              localStorage.setItem("accessToken", token);
            }
          });
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(loginError());
        }
      });
  };
}
export function signupRequest() {
  return {
    type: SIGNUP_REQUEST,
  };
}
function signupSuccess() {
  return {
    type: SIGNUP_SUCCESS,
  };
}
export function signup(username, password, passwordConfirm) {
  return (dispatch) => {
    dispatch({ type: SIGNUP_REQUEST });

    return axios({
      url: "/api/signup",
      data: {
        username,
        password,
        passwordConfirm,
      },
      method: "POST",
    })
      .then((res) => {
        if (res.status === 200) {
          dispatch(signupSuccess());
          return "signup";
        }
      })
      .catch((err) => {
        let error = err.response.data;
        let passwordError;
        if (password !== passwordConfirm) {
          passwordError = "Passwords do not match";
        }
        dispatch({ type: SIGNUP_ERROR, error, passwordError });
      });
  };
}
