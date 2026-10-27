const mongoose = require("mongoose");
const review = require("./reviews.js");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image: {
            url: String,
            filename: String,
        }, 
    price:{
        type:Number,
        required:true,
        min:0
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
    reviews:[{

        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
});

// mongoose post middleware 
listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await review.deleteMany({_id:{ $in: listing.reviews}});
    }
});

const listing = mongoose.model("listing", listingSchema);

module.exports = listing; 

