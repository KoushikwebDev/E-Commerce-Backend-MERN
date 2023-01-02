const Product = require("../model/product.schema");
const asyncHandler = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/emailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const WhereClause = require("../utils/whereClause");

exports.addProduct = asyncHandler(async (req, res) => {
  const { name, price, description } = req.body;

  if (!(name && price && description)) {
    throw new customError("All fields are required", 400);
  }

  let imeagesArray = [];
  if (!req.files) {
    throw new customError("Please Add Photos.", 400);
  }
  // console.log(req.files.photos);

  // for single photo upload
  if (!Array.isArray(req.files.photos)) {
    let productPhoto = req.files.photos;

    let result = await cloudinary.uploader.upload(productPhoto.tempFilePath, {
      folder: "products",
      width: 150,
      crop: "scale",
    });
    //   console.log(result);
    imeagesArray.push({
      id: result.public_id,
      secure_url: result.secure_url,
    });
  }

  if (Array.isArray(req.files.photos)) {
    for (let i = 0; i < req.files.photos.length; i++) {
      let productPhoto = req.files.photos;

      let result = await cloudinary.uploader.upload(
        productPhoto[i].tempFilePath,
        {
          folder: "products",
          width: 150,
          crop: "scale",
          // transformation: {
          //   width: 150,
          // },
        }
      );
      //   console.log(result);
      imeagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imeagesArray;
  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = asyncHandler(async (req, res) => {
  const resultPerPage = 6;
  const totalProductCount = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();
  //   console.log(productsObj);

  let products = await productsObj.base;
  console.log(products);

  const fiteredProduct = products.length;

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    fiteredProduct,
    totalProductCount,
  });
});

exports.getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new customError("No product with this id");
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// review
exports.addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // average rating
  product.rating = product.reviews.reduce((acc, item) => {
    return (item.rating + acc, 0) / product.reviews.length;
  });

  product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.query || req.body;
  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  const numberOfReviews = reviews.length;

  product.rating = product.reviews.reduce((acc, item) => {
    return (item.rating + acc, 0) / product.reviews.length;
  });

  // update product

  await Product.findByIdAndUpdate(
    productId,
    { reviews, rating, numberOfReviews },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getOnlyReviewsForOneProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    throw new customError("Product not fount with this id", 400);
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Admin Controller
exports.adminGetAllProduct = asyncHandler(async (req, res) => {
  const products = await Product.find();

  if (!products) {
    throw new customError("Products not found", 400);
  }

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateOneProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new customError("Product not found", 400);
  }

  let imeagesArray = [];
  if (req.files) {
    // destory existing photo from cloudinary
    for (let index = 0; index < req.files.photos.length; index++) {
      const response = await cloudinary.uploader.destroy(
        product.photos[index].id
      );
    }

    // upload new photo

    for (let index = 0; index < req.files.photos.length; index++) {
      const result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imeagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imeagesArray;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteOneProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new customError("Product not found", 400);
  }

  // destory existing photo from cloudinary
  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.uploader.destroy(product.photos[index].id);
  }

  const response = await product.remove();

  res.status(200).json({
    success: true,
    response,
  });
});
