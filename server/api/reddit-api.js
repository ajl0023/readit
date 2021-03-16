const jwt = require("jsonwebtoken");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/Comment");
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { nextTick } = require("process");
const { resolve } = require("path");

module.exports = (app) => {
  app.get("/api/posts", (req, res) => {
    let userIdSTRING;
    let lastId;
    let firstId;
    let sortOrder = 1;
    let limit = 10;
    if (req.user) {
      userIdSTRING = req.user._id.toString();
    }
    if (req.query.page && req.query.lastId) {
      lastId = req.query.lastId;

      lastQueryId = { _id: { $gt: lastId } };
    }

    if (req.query.page && req.query.firstId) {
      firstId = req.query.firstId;
      sortOrder = -1;
      lastQueryId = { _id: { $lt: firstId } };
    }
    if (!req.query.firstId && !req.query.lastId) {
      lastQueryId = null;
    }

    Post.find(lastQueryId)

      .sort({ _id: sortOrder })

      .limit(limit)

      .populate({ path: "author", select: "username _id" })

      .then((posts) => {
        let newPosts = posts.map((post) => {
          for (let i = 0; i < post.upVotes.length; i++) {
            post.upVotes[i] = post.upVotes[i].toString();
          }
          for (let i = 0; i < post.downVotes.length; i++) {
            post.downVotes[i] = post.downVotes[i].toString();
          }

          return post.toJSON();
        });

        posts = newPosts.map((a) => {
          if (
            a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 1;
            return a;
          }
          if (
            !a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 0;
            return a;
          }
          if (
            a.downVotes.includes(userIdSTRING) &&
            !a.upVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = -1;
            return a;
          }
        });

        if (lastId) {
          let lastPost = posts[posts.length - 1]._id;

          Post.find({ _id: { $gt: lastPost } })
            .sort({ _id: 1 })
            .cursor()
            .next((err, result) => {
              if (result === null) {
                let firstItemInPage = posts[0];
                firstItemInPage["page"] = "last";
                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (firstId) {
          posts = posts.reverse();

          let firstPost = posts[0]._id;

          Post.find({ _id: { $lt: firstPost } })
            .sort({ _id: -1 })
            .cursor()
            .next((err, result) => {
              if (result === null) {
                let firstItemInPage = posts[0];
                firstItemInPage["page"] = 1;
                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (!firstId && !lastId) {
          posts[0]["page"] = 1;
          res.json(posts);
        }
      })
      .catch((err) => {
        res.json({ error: err });
      });
  });
  app.get("/api/posts/new", async (req, res) => {
    let userIdSTRING;
    let lastId;
    let firstId;
    let sortOrder = -1;
    let lastIdDate;
    let firstIdDate;
    let searchQuery;

    if (req.user) {
      userIdSTRING = req.user._id.toString();
    }

    function epochSeconds(d) {
      return d.getTime() / 1000 - 1134028003;
    }
    Post.find({}, (err, result) => {
      result.map((post) => {
        Post.updateMany(
          { _id: post._id },
          {
            createdAt: epochSeconds(post.createdAt),
          }
        );
      });
    });
    if (!req.query.firstId && !req.query.lastId) {
      searchQuery = {};
      req.session.currentPage = 1;
    }

    if (req.query.page && req.query.firstId) {
      sortOrder = 1;
      firstId = req.query.firstId;
      await Post.findById(firstId).then((post) => {
        firstIdDate = post.createdAt;
      });
      searchQuery = { createdAt: { $gt: firstIdDate } };
    }

    if (req.query.page && req.query.lastId) {
      sortOrder = -1;
      lastId = req.query.lastId;
      await Post.findById(lastId).then((post) => {
        lastIdDate = post.createdAt;
      });

      searchQuery = { createdAt: { $lt: lastIdDate } };
    }
    req.session.currentURL = req.url;

    var options = {
      sort: {
        createdAt: sortOrder,
      },
      limit: 10,
      populate: {
        path: "author",
        select: "username _id",
      },
    };
    Post.paginate(searchQuery, options)
      .then((posts) => {
        let pageNumber = posts.page;

        posts = posts.docs;

        let newPosts = posts.map((post) => {
          for (let i = 0; i < post.upVotes.length; i++) {
            post.upVotes[i] = post.upVotes[i].toString();
          }
          for (let i = 0; i < post.downVotes.length; i++) {
            post.downVotes[i] = post.downVotes[i].toString();
          }

          return post.toJSON();
        });
        posts = newPosts.map((a) => {
          if (
            a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 1;
            return a;
          }
          if (
            !a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 0;
            return a;
          }
          if (
            a.downVotes.includes(userIdSTRING) &&
            !a.upVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = -1;
            return a;
          }
        });
        posts.forEach(() => {
          const findComment = (comments) => {
            if (comments.length > 0) {
              for (let index = 0; index < comments.length; index++) {
                let comment = comments[index];

                let upvotedUsersSTRING = comment.upVotes.toString();
                let downVotedUsersSTRING = comment.downVotes.toString();
                if (upvotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = 1;
                }

                if (downVotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = -1;
                }
                if (
                  !downVotedUsersSTRING.includes(userIdSTRING) &&
                  !upvotedUsersSTRING.includes(userIdSTRING)
                ) {
                  comment["voteState"] = 0;
                }
                if (!comments) {
                  return comments;
                }
                const finished = findComment(comment.comments);
                if (finished) {
                  return finished;
                }
              }
            }
          };
        });

        if (lastId) {
          let lastPost = posts[posts.length - 1];

          Post.find({ createdAt: { $lt: lastPost.createdAt } })
            .sort({ createdAt: -1 })
            .cursor()
            .next((err, result) => {
              if (!result) {
                let firstItemInPage = posts[0];
                firstItemInPage["page"] = "last";
                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (firstId) {
          posts = posts.reverse();

          let firstPost = posts[0];
          Post.find({ createdAt: { $gt: firstPost.createdAt } })
            .cursor()
            .next((err, result) => {
              if (!result) {
                let firstItemInPage = posts[0];
                firstItemInPage["page"] = 1;
                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (!firstId && !lastId) {
          pageNumber = 1;
          req.session.currentPage = pageNumber;

          res.json(posts);
        }
      })
      .catch((err) => {
        res.json({ error: err });
      });
  });
  app.get("/api/posts/top", async (req, res) => {
    let userIdSTRING;
    let lastId;
    let firstId;
    let sortOrder = -1;
    let lastIdTopScore;
    let firstIdTopScore;

    if (req.user) {
      userIdSTRING = req.user._id.toString();
    }

    if (!req.query.firstId && !req.query.lastId) {
      searchQuery = {};
      req.session.currentPage = 1;
    }

    if (req.query.page && req.query.firstId) {
      sortOrder = 1;
      firstId = req.query.firstId;
      await Post.findById(firstId).then((post) => {
        firstIdTopScore = post.topScore;
      });
      searchQuery = { topScore: { $gt: firstIdTopScore } };
    }

    if (req.query.page && req.query.lastId) {
      sortOrder = -1;
      lastId = req.query.lastId;
      await Post.findById(lastId).then((post) => {
        lastIdTopScore = post.topScore;
      });

      searchQuery = { topScore: { $lt: lastIdTopScore } };
    }
    req.session.currentURL = req.url;
    var options = {
      sort: {
        topScore: sortOrder,
      },
      limit: 10,
      populate: {
        path: "author",
        select: "username _id",
      },
    };
    Post.paginate(searchQuery, options)
      .then((posts) => {
        let pageNumber = posts.page;

        posts = posts.docs;

        let newPosts = posts.map((post) => {
          for (let i = 0; i < post.upVotes.length; i++) {
            post.upVotes[i] = post.upVotes[i].toString();
          }
          for (let i = 0; i < post.downVotes.length; i++) {
            post.downVotes[i] = post.downVotes[i].toString();
          }

          return post.toJSON();
        });
        posts = newPosts.map((a) => {
          if (
            a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 1;
            return a;
          }
          if (
            !a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 0;
            return a;
          }
          if (
            a.downVotes.includes(userIdSTRING) &&
            !a.upVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = -1;
            return a;
          }
        });
        posts.forEach(() => {
          const findComment = (comments) => {
            if (comments.length > 0) {
              for (let index = 0; index < comments.length; index++) {
                let comment = comments[index];

                let upvotedUsersSTRING = comment.upVotes.toString();
                let downVotedUsersSTRING = comment.downVotes.toString();
                if (upvotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = 1;
                }

                if (downVotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = -1;
                }
                if (
                  !downVotedUsersSTRING.includes(userIdSTRING) &&
                  !upvotedUsersSTRING.includes(userIdSTRING)
                ) {
                  comment["voteState"] = 0;
                }
                if (!comments) {
                  return comments;
                }
                const finished = findComment(comment.comments);
                if (finished) {
                  return finished;
                }
              }
            }
          };
        });

        if (lastId) {
          let lastPost = posts[posts.length - 1];

          Post.find({ topScore: { $lt: lastPost.topScore } })
            .sort({ topScore: -1 })
            .cursor()
            .next((err, result) => {
              if (!result) {
                let firstItemInPage = posts[0];
                firstItemInPage["page"] = "last";
                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (firstId) {
          posts = posts.reverse();

          let firstPost = posts[0];
          Post.find({ topScore: { $gt: firstPost.topScore } })
            .cursor()
            .next((err, result) => {
              if (result === null) {
                posts[0]["page"] = 1;

                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (!firstId && !lastId) {
          pageNumber = 1;
          req.session.currentPage = pageNumber;

          res.json(posts);
        }
      })
      .catch((err) => {
        res.json({ error: err });
      });
  });
  app.get("/api/posts/hot", async (req, res) => {
    let userIdSTRING;
    let lastId;
    let firstId;
    let sortOrder = -1;
    let lastIdHotScore;
    let firstIdHotScore;

    if (req.user) {
      userIdSTRING = req.user._id.toString();
    } else {
      userIdSTRING = "5f9a08fb68fdf612d0ca3fa2";
    }

    if (!req.query.firstId && !req.query.lastId) {
      searchQuery = {};
      req.session.currentPage = 1;
    }

    if (req.query.page && req.query.firstId) {
      sortOrder = 1;
      firstId = req.query.firstId;
      await Post.findById(firstId).then((post) => {
        firstIdHotScore = post.hotScore;
      });
      searchQuery = { hotScore: { $gt: firstIdHotScore } };
    }

    if (req.query.page && req.query.lastId) {
      sortOrder = -1;
      lastId = req.query.lastId;
      await Post.findById(lastId).then((post) => {
        lastIdHotScore = post.hotScore;
      });

      searchQuery = { hotScore: { $lt: lastIdHotScore } };
    }
    req.session.currentURL = req.url;
    var options = {
      sort: {
        hotScore: sortOrder,
      },
      limit: 10,
      populate: {
        path: "author",
        select: "username _id",
      },
    };
    Post.paginate(searchQuery, options)
      .then((posts) => {
        let pageNumber = posts.page;

        posts = posts.docs;

        let newPosts = posts.map((post) => {
          for (let i = 0; i < post.upVotes.length; i++) {
            post.upVotes[i] = post.upVotes[i].toString();
          }
          for (let i = 0; i < post.downVotes.length; i++) {
            post.downVotes[i] = post.downVotes[i].toString();
          }

          return post.toJSON();
        });
        posts = newPosts.map((a) => {
          if (
            a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 1;
            return a;
          }
          if (
            !a.upVotes.includes(userIdSTRING) &&
            !a.downVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = 0;
            return a;
          }
          if (
            a.downVotes.includes(userIdSTRING) &&
            !a.upVotes.includes(userIdSTRING)
          ) {
            a["voteState"] = -1;
            return a;
          }
        });
        posts.forEach(() => {
          const findComment = (comments) => {
            if (comments.length > 0) {
              for (let index = 0; index < comments.length; index++) {
                let comment = comments[index];

                let upvotedUsersSTRING = comment.upVotes.toString();
                let downVotedUsersSTRING = comment.downVotes.toString();
                if (upvotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = 1;
                }

                if (downVotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = -1;
                }
                if (
                  !downVotedUsersSTRING.includes(userIdSTRING) &&
                  !upvotedUsersSTRING.includes(userIdSTRING)
                ) {
                  comment["voteState"] = 0;
                }
                if (!comments) {
                  return comments;
                }
                const finished = findComment(comment.comments);
                if (finished) {
                  return finished;
                }
              }
            }
          };
        });

        if (lastId) {
          let lastPost = posts[posts.length - 1];

          Post.find({ hotScore: { $lt: lastPost.hotScore } })
            .sort({ hotScore: -1 })
            .cursor()
            .next((err, result) => {
              if (!result) {
                let firstItemInPage = posts[0];
                firstItemInPage["page"] = "last";
                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (firstId) {
          posts = posts.reverse();

          let firstPost = posts[0];
          Post.find({ hotScore: { $gt: firstPost.hotScore } })
            .cursor()
            .next((err, result) => {
              if (result === null) {
                posts[0]["page"] = 1;

                res.json(posts);
              } else {
                res.json(posts);
              }
            });
        }
        if (!firstId && !lastId) {
          pageNumber = 1;
          req.session.currentPage = pageNumber;

          res.json(posts);
        }
      })
      .catch((err) => {
        res.json({ error: err });
      });
  });
  app.get("/api/post/:postid", (req, res) => {
    const postId = req.params.postid;

    if (!req.user) {
      Post.findById(postId)
        .populate({
          path: "author",
          select: "username -_id",
        })
        .then((post) => {
          res.json(post);
        });
    } else {
      let userIdSTRING = req.user._id.toString();
      Post.findById(postId)
        .populate({ path: "author", select: "username _id" })
        .then((post) => {
          const findComment = (comments) => {
            if (comments.length > 0) {
              for (let index = 0; index < comments.length; index++) {
                let comment = comments[index];

                let upvotedUsersSTRING = comment.upVotes.toString();
                let downVotedUsersSTRING = comment.downVotes.toString();
                if (upvotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = 1;
                }

                if (downVotedUsersSTRING.includes(userIdSTRING)) {
                  comment["voteState"] = -1;
                }
                if (
                  !downVotedUsersSTRING.includes(userIdSTRING) &&
                  !upvotedUsersSTRING.includes(userIdSTRING)
                ) {
                  comment["voteState"] = 0;
                }
                if (!comments) {
                  return comments;
                }
                const finished = findComment(comment.comments);
                if (finished) {
                  return finished;
                }
              }
            }
          };

          let upvotedUsers = post.upVotes;
          let downVotedUsers = post.downVotes;

          let upvotedUsersSTRING = upvotedUsers.map((a) => {
            return a.toString();
          });
          let downVotedUsersSTRING = downVotedUsers.map((a) => {
            return a.toString();
          });

          post = post.toJSON();

          if (upvotedUsersSTRING.includes(userIdSTRING)) {
            Object.assign(post, { voteState: 1 });
          } else if (downVotedUsersSTRING.includes(userIdSTRING)) {
            Object.assign(post, { voteState: -1 });
          } else {
            Object.assign(post, { voteState: 0 });
          }

          res.json(post);
        });
    }
  });
  const upload = multer({ dest: "uploads/" });
  app.post("/api/post/new", upload.single("file"), (req, res) => {
    AWS.config.setPromisesDependency();

    if (req.file) {
      const s3 = new AWS.S3();
      var params = {
        ACL: "public-read",
        Bucket: process.env.BUCKET_NAME,
        Body: fs.createReadStream(req.file.path),
        Key: `post/${req.file.originalname}`,
      };
      s3.upload(params, (err, data) => {
        if (err) {
        }
        if (data) {
          fs.unlinkSync(req.file.path);
          const locationUrl = data.Location;
          let newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            createdAt: Date.now(),
            author: req.user._id,
            image: locationUrl,
            upVotes: [req.user._id],
            downVotes: [],
          });
          newPost.voteTotal = newPost.upVotes.length - newPost.downVotes.length;

          return newPost.save((err, result) => {
            result = result.toJSON();
            result["voteState"] = 1;
            res.json(result);
            return err;
          });
        }
      });
    } else {
      newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        createdAt: Date.now(),
        author: req.user._id,
        upVotes: [req.user._id],
        downVotes: [],
      });
      function hot(score, date) {
        var sign = score > 0 ? 1 : score < 0 ? -1 : 0;
        var order = Math.log(Math.max(Math.abs(score), 1)) / Math.LN10;
        var seconds = epochSeconds(date);
        var product = order + (sign * seconds) / 45000;
        return Math.round(product * 10000000) / 10000000;
      }
      function epochSeconds(d) {
        return d.getTime() / 1000 - 1134028003;
      }

      newPost.voteTotal = newPost.upVotes.length - newPost.downVotes.length;
      newPost.hotScore = hot(newPost.voteTotal, newPost.createdAt);
      newPost.topScore = epochSeconds(newPost.createdAt) * newPost.voteTotal;
      return newPost
        .save()
        .then((newPost) => {
          newPost = newPost.toJSON();
          newPost["voteState"] = 1;
          res.json(newPost);
        })
        .catch(() => {});
    }
  });

  app.put("/api/posts/vote-up/:id", (req, res) => {
    let postId = req.params.id;

    Post.findById(postId).then((post) => {
      const { _id } = req.user;
      let downVotes = post.downVotes;
      let upVotes = post.upVotes;
      let user = _id.toString();
      let downvotedUsersSTRING = downVotes.map((a) => {
        return a.toString();
      });
      let upvotedUsersSTRING = upVotes.map((a) => {
        return a.toString();
      });
      let filteredUpvotes = upvotedUsersSTRING.filter((id) => {
        if (id !== user) {
          return id;
        }
      });
      let filteredDownvotes = downvotedUsersSTRING.filter((id) => {
        if (id !== user) {
          return id;
        }
      });
      if (
        !downvotedUsersSTRING.includes(user) &&
        !upvotedUsersSTRING.includes(user)
      ) {
        upVotes.push(_id);
      }
      if (
        downvotedUsersSTRING.includes(user) &&
        !upvotedUsersSTRING.includes(user)
      ) {
        upVotes.push(_id);
        post.downVotes = filteredDownvotes;
      }
      if (
        !downvotedUsersSTRING.includes(user) &&
        upvotedUsersSTRING.includes(user)
      ) {
        post.upVotes = filteredUpvotes;
      }
      if (
        downvotedUsersSTRING.includes(user) &&
        upvotedUsersSTRING.includes(user)
      ) {
        post.upVotes = [];
        post.downVotes = [];
      }
      function hot(score, date) {
        var sign = score > 0 ? 1 : score < 0 ? -1 : 0;
        var order = Math.log(Math.max(Math.abs(score), 1)) / Math.LN10;
        var seconds = epochSeconds(date);
        var product = order + (sign * seconds) / 45000;
        return Math.round(product * 10000000) / 10000000;
      }
      function epochSeconds(d) {
        return d.getTime() / 1000 - 1134028003;
      }
      post.voteTotal = post.upVotes.length - post.downVotes.length;
      post.hotScore = hot(post.voteTotal, post.createdAt);
      post.topScore = epochSeconds(post.createdAt) * post.voteTotal;
      post.save((err) => {
        if (err) {
        } else {
          res.json("");
        }
      });
    });
  });
  app.put("/api/comment/vote-up", (req) => {
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    Post.findById(postId)
      .then((post) => {
        const findComment = (id, comments) => {
          if (comments.length > 0) {
            for (var index = 0; index < comments.length; index++) {
              const comment = comments[index];
              if (comment._id == id) {
                return comment;
              }
              const foundComment = findComment(id, comment.comments);
              if (foundComment) {
                return foundComment;
              }
            }
          }
        };

        const comment = findComment(commentId, post.comments);
        const { _id } = req.user;
        let downVotes = comment.downVotes;
        let upVotes = comment.upVotes;
        let user = _id.toString();
        let downvotedUsersSTRING = downVotes.map((a) => {
          return a.toString();
        });
        let upvotedUsersSTRING = upVotes.map((a) => {
          return a.toString();
        });
        let filteredUpvotes = upvotedUsersSTRING.filter((id) => {
          if (id !== user) {
            return id;
          }
        });
        let filteredDownvotes = downvotedUsersSTRING.filter((id) => {
          if (id !== user) {
            return id;
          }
        });
        if (
          !downvotedUsersSTRING.includes(user) &&
          !upvotedUsersSTRING.includes(user)
        ) {
          upVotes.push(_id);
        }
        if (
          downvotedUsersSTRING.includes(user) &&
          !upvotedUsersSTRING.includes(user)
        ) {
          upVotes.push(_id);
          comment.downVotes = filteredDownvotes;
        }
        if (
          !downvotedUsersSTRING.includes(user) &&
          upvotedUsersSTRING.includes(user)
        ) {
          comment.upVotes = filteredUpvotes;
        }
        if (
          downvotedUsersSTRING.includes(user) &&
          upvotedUsersSTRING.includes(user)
        ) {
          comment.upVotes = [];
          comment.downVotes = [];
        }
        comment.voteTotal = comment.upVotes.length - comment.downVotes.length;

        post.markModified("comments");
        post.save();
      })

      .catch(() => {});
  });
  app.put("/api/comment/vote-down", (req) => {
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    Post.findById(postId)
      .then((post) => {
        const findComment = (id, comments) => {
          if (comments.length > 0) {
            for (var index = 0; index < comments.length; index++) {
              const comment = comments[index];
              if (comment._id == id) {
                return comment;
              }
              const foundComment = findComment(id, comment.comments);
              if (foundComment) {
                return foundComment;
              }
            }
          }
        };

        const comment = findComment(commentId, post.comments);
        const { _id } = req.user;
        let downVotes = comment.downVotes;
        let upVotes = comment.upVotes;
        let user = _id.toString();
        let downvotedUsersSTRING = downVotes.map((a) => {
          return a.toString();
        });
        let upvotedUsersSTRING = upVotes.map((a) => {
          return a.toString();
        });
        let filteredUpvotes = upvotedUsersSTRING.filter((id) => {
          if (id !== user) {
            return id;
          }
        });
        let filteredDownvotes = downvotedUsersSTRING.filter((id) => {
          if (id !== user) {
            return id;
          }
        });
        if (
          !downvotedUsersSTRING.includes(user) &&
          !upvotedUsersSTRING.includes(user)
        ) {
          downVotes.push(_id);
        }
        if (
          !downvotedUsersSTRING.includes(user) &&
          upvotedUsersSTRING.includes(user)
        ) {
          downVotes.push(_id);
          comment.upVotes = filteredUpvotes;
        }
        if (
          downvotedUsersSTRING.includes(user) &&
          !upvotedUsersSTRING.includes(user)
        ) {
          comment.downVotes = filteredDownvotes;
        }
        if (
          downvotedUsersSTRING.includes(user) &&
          upvotedUsersSTRING.includes(user)
        ) {
          comment.upVotes = [];
          comment.downVotes = [];
        }
        comment.voteTotal = comment.upVotes.length - comment.downVotes.length;

        post.markModified("comments");
        post.save();
      })

      .catch(() => {});
  });
  app.put("/api/posts/vote-down/:id", (req, res) => {
    let postId = req.params.id;
    Post.findById(postId).then((post) => {
      const { _id } = req.user;
      let downVotes = post.downVotes;
      let upVotes = post.upVotes;
      let user = _id.toString();
      let downvotedUsersSTRING = downVotes.map((a) => {
        return a.toString();
      });
      let upvotedUsersSTRING = upVotes.map((a) => {
        return a.toString();
      });
      let filteredUpvotes = upvotedUsersSTRING.filter((id) => {
        if (id !== user) {
          return id;
        }
      });
      let filteredDownvotes = downvotedUsersSTRING.filter((id) => {
        if (id !== user) {
          return id;
        }
      });
      if (
        !downvotedUsersSTRING.includes(user) &&
        !upvotedUsersSTRING.includes(user)
      ) {
        downVotes.push(_id);
      }
      if (
        !downvotedUsersSTRING.includes(user) &&
        upvotedUsersSTRING.includes(user)
      ) {
        post.upVotes = filteredUpvotes;
        downVotes.push(_id);
      }
      if (
        downvotedUsersSTRING.includes(user) &&
        !upvotedUsersSTRING.includes(user)
      ) {
        post.downVotes = filteredDownvotes;
      }
      if (
        downvotedUsersSTRING.includes(user) &&
        upvotedUsersSTRING.includes(user)
      ) {
        post.upVotes = filteredUpvotes;
        post.downVotes = filteredDownvotes;
      }
      function hot(score, date) {
        var sign = score > 0 ? 1 : score < 0 ? -1 : 0;
        var order = Math.log(Math.max(Math.abs(score), 1)) / Math.LN10;
        var seconds = epochSeconds(date);
        var product = order + (sign * seconds) / 45000;
        return Math.round(product * 10000000) / 10000000;
      }
      function epochSeconds(d) {
        return d.getTime() / 1000 - 1134028003;
      }
      post.voteTotal = post.upVotes.length - post.downVotes.length;
      post.hotScore = hot(post.voteTotal, post.createdAt);
      post.topScore = epochSeconds(post.createdAt) * post.voteTotal;

      post.save((err) => {
        if (err) {
        } else {
          res.json("");
        }
      });
    });
  });
  app.post("/api/comment/new", (req, res) => {
    const postId = req.body.postId;
    Post.findById(postId).then((post) => {
      let newComment = new Comment({
        content: req.body.content,
        postId: postId,
        author: req.user._id,
        authorName: req.user.username,
      });
      newComment.upVotes.push(req.user._id);
      newComment.voteTotal =
        newComment.upVotes.length + newComment.downVotes.length;
      newComment = newComment.toJSON();
      newComment["voteState"] = 1;
      post.comments.unshift(newComment);
      post.save(() => {
        res.json(newComment);
      });
    });
  });

  app.post("/api/comments/:commentId/replies", (req, res) => {
    const currentUser = req.user;
    const username = currentUser.username;
    const postId = req.body.postId;
    const commentId = req.params.commentId;
    Post.findById(postId)
      .then((post) => {
        const findComment = (id, comments) => {
          if (comments.length > 0) {
            for (var index = 0; index < comments.length; index++) {
              const comment = comments[index];
              if (comment._id == id) {
                return comment;
              }
              const foundComment = findComment(id, comment.comments);
              if (foundComment) {
                return foundComment;
              }
            }
          }
        };

        const comment = findComment(commentId, post.comments);

        let commentNew = new Comment({
          content: req.body.content,
          author: currentUser._id,
          postId,
          authorName: username,
          parentId: commentId,
        });

        commentNew.upVotes.push(req.user._id);
        commentNew.voteTotal =
          commentNew.upVotes.length + commentNew.downVotes.length;
        commentNew = commentNew.toJSON();
        commentNew["voteState"] = 1;

        comment.comments.unshift(commentNew);
        post.markModified("comments");
        return post.save(() => {
          res.json(commentNew);
        });
      })

      .catch(() => {});
  });
  app.post("/api/signup", (req, res) => {
    const saltRounds = 10;
    const password = req.body.password;
    User.find({ username: req.body.username }, (err, result) => {
      if (result.length === 0) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            let newUser = new User({
              username: req.body.username,
              password: hash,
              createdAt: Date.now(),
            });
            newUser.save().then(res.json("done"));
          });
        });
      } else {
        res.status(409).json("Username already taken");
      }
    });
  });
  app.post("/api/login", (req, res) => {
    User.findOne({ username: req.body.username }).then((user) => {
      if (user) {
        let hash = user.password;
        let password = req.body.password;
        bcrypt.compare(password, hash).then((result) => {
          if (!result) {
            res.status(401).json("Unauthorized");
          } else {
            const token = jwt.sign(
              {
                _id: user._id,
                username: user.username,
              },
              process.env.ACCESS_TOKEN,
              { expiresIn: "30000" }
            );

            const refreshToken = jwt.sign(
              { _id: user._id, username: user.username },
              process.env.REFRESH_TOKEN,
              {
                expiresIn: "60d",
              }
            );
            res.cookie("refresh", refreshToken, {
              maxAge: 365 * 24 * 60 * 60 * 1000,
            });
            res.json({
              jwt_token: token,
              username: user.username,
              _id: user._id,
            });
          }
        });
      } else {
        res.status(401).json("Unauthorized");
      }
    });
  });
  app.post("/api/refresh", (req, res, next) => {
    if (!req.headers["authorization"]) {
      return next();
    }

    if (!req.cookies.refresh) {
      res.status(403);
    }
    let refreshToken = req.cookies.refresh;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "unauth" : err.message;
        res.json({ err: message });
      } else {
        const token = jwt.sign(
          { _id: payload, username: payload.username },
          process.env.ACCESS_TOKEN,
          { expiresIn: "30000" }
        );
        res.json({
          jwt_token: token,
          _id: payload._id,
          username: payload.username,
        });
      }
    });
  });
  app.post("/api/logout", (req, res) => {
    res.clearCookie("refresh");
    res.json({});
  });
  app.get("/api/logged-in", (req, res, next) => {
    if (!req.headers["authorization"]) {
      res.clearCookie("refresh");
      return next();
    }
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    if (!req.cookies.refresh) {
      res.status(403);
    } else {
      jwt.verify(token, process.env.ACCESS_TOKEN, (err) => {
        if (err) {
          const message =
            err.name === "JsonWebTokenError" ? "unauth" : err.message;
          res.json({
            error: message,
            username: req.user.username,
            _id: req.user._id,
          });
        } else {
          res.json({ username: req.user.username, _id: req.user._id });
        }
      });
    }
  });
  app.delete("/api/delete/:postId", (req, res) => {
    let currentId = req.params.postId;
    let user = req.user._id.toString();

    Post.findById(currentId).then((post) => {
      let stringedAuthor = post.author.toString();

      if (stringedAuthor === user) {
        Post.deleteOne({ _id: currentId }, function (err) {
          if (err) {
          } else {
          }
        });
      }
    });
    res.json("deleted");
  });
  app.put("/api/edit/:postId", (req, res) => {
    let currentId = req.params.postId;
    let user = "5f9a08fb68fdf612d0ca3fa2";
    Post.findById(currentId).then((post) => {
      let stringedAuthor = post.author.toString();
      if (stringedAuthor === user) {
        Post.updateOne(
          { _id: currentId },
          {
            content: req.body.content,
          }
        ).then((post) => {
          post.save();
        });
      }
    });
    res.json("updated");
  });
};
