const { Schema, model } = require("mongoose");

const tagSchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = model("Tag", tagSchema);
