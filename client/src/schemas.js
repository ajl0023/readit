import { normalize, schema } from "normalizr";

export const comment = new schema.Entity(
  "comments",
  {},
  { idAttribute: "_id" }
);

export const comments = new schema.Array(comment);
comment.define({ comments });
export const post = new schema.Entity(
  "posts",
  {
    comments: [comment],
  },
  { idAttribute: "_id" }
);
