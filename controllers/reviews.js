const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.cerateReview = async(req,res)=>{
        console.log(req.params.id)
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview._id);

     await newReview.save();
     await listing.save();
    req.flash("success", "New reivew is created");
     res.redirect(`/listings/${listing._id}`);
    };

    module.exports.deleteReview = async(req,res)=>{
    let { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) 
    await  Review.findByIdAndDelete(reviewId)

    req.flash("success", "Review  deleted ");
    res.redirect(`/listings/${id}`);
};