const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const review = require("../models/reviews.js");
const listing = require("../models/listing.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// post route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.distroyReview));

module.exports = router;