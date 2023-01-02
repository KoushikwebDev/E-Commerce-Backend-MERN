const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      maxlength: [120, "Product name should not be more than 120 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      maxlength: [5, "Product price should not be more than 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      trim: true,
    },
    photos: [
      {
        id: {
          type: String,
          required: [true, "Please provide photo id"],
        },
        secure_url: {
          type: String,
          required: [true, "Please provide photo Url"],
        },
      },
    ],

    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: {
        values: ["shortssleevs", "longsleevs", "sweatshirt", "hoodies"],
        message:
          "Please select Category only shorts-sleevs,long-sleevs,sweat-shirt,hoodies",
      },
    },
    stock: {
      type: Number,
      required: [true, "Please Add a no. In Stock"],
    },
    brand: {
      type: String,
      required: [true, "Please add brand for clothing"],
    },

    rating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
