  const { Schema, model } = require("mongoose");

  const blogSchema = new Schema(
    {
      title: {
        type: String,
        required: true,
      },
      body:{
        type: String,
        required: true,
      },
      coverImageUrl: {
        type: String,
        required: false,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    },
    { timestamps: true }
  );

  blogSchema.virtual("comments", {
    ref: "comment",
    localField: "_id",
    foreignField: "blogId",
  });

  const BLOG = new model("blog", blogSchema);

  module.exports = BLOG;
