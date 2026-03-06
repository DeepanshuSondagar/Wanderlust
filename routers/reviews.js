const express =  require("express");
const router = express.Router({mergeParams: true});
 const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const Review = require("../models/review.js");
const reviewController = require("../controllers/reviews.js");


//review 
//post  review route
router.post("/",isLoggedIn, validateReview,
     wrapAsync(reviewController.cerateReview));


//Delete Reviews Routes
router.delete("/:reviewId",isLoggedIn, isReviewAuthor,wrapAsync(reviewController.deleteReview)); 

module.exports = router