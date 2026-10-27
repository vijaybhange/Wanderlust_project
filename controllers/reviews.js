const review = require("../models/reviews.js");
const listing = require("../models/listing.js");

module.exports.createReview = async(req,res)=>{
      let Listing = await listing.findById(req.params.id);
      let newReview = new review(req.body.review);
      newReview.author = req.user._id;
      Listing.reviews.push(newReview);    

     await newReview.save();
     await Listing.save();
     req.flash("success","Thanks for your Feedback!");
     res.redirect(`/listings/${Listing._id}`);
}

module.exports.distroyReview = async(req,res)=>{
     let{id, reviewId} = req.params;
     await listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}} );
     await review.findByIdAndDelete(reviewId);
     req.flash("success","Review Deleted Successfully!");
     res.redirect(`/listings/${id}`);

}