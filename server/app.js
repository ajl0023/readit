const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
const path = require("path");
app.use(cookieParser());
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
app.use(express.static(path.join(__dirname, "../client/build")));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
app.listen(process.env.PORT, () => {});
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const corsOptions = {
  // origin: "http://localhost:3001",
  // credentials: true,
  // maxAge: 600,
};
app.use(cors(corsOptions));
const checkauth = (req, res, next) => {
  if (req.headers["authorization"]) {
    const authHeader = req.headers["authorization"];
    const refreshToken = req.cookies.refresh;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, payload) => {
      if (err) {
        req.user = null;
      } else {
        req.user = payload;
      }
    });
  }
  next();
};
const connection = mongoose.createConnection(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: "sessions",
});
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
app.use(
  session({
    secret: "somesecret",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(checkauth);
require("./api/reddit-api")(app);
module.exports = app;
