const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "please provide review"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "Please provide comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ products: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productID) {
  const result = await this.aggregate([
    { $match: { product: productID } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  await this.model("product").findOneAndUpdate(
    {
      _id: productID,
    },
    {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0,
    }
  );
  console.log(result);
};
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("deleteOne", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("review", ReviewSchema);
