const listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res) => {
    const alllistings = await listing.find({});
    res.render("listings/index.ejs", { alllistings });
}; 

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
   let { id } = req.params;
    const foundlisting = await listing.findById(id).populate({path:"reviews", populate:{path:"author"},}).populate("owner");
    if(!foundlisting){
        req.flash("error", "Listing does`t Exists!!");
       return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing: foundlisting });
    
}


module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 2
    })
   .send();

    // Check whether Mapbox found the location works when write random location
        let features = response.body.features;

        if (!features || features.length === 0) {
            req.flash("error", "Location not found. Please enter a more specific location.");
            return res.redirect("/listings/new");
        }

    let url = req.file.path;
    let filename = req.file.filename;
    
    const newlisting = new listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url, filename};
    newlisting.geometry = response.body.features[0].geometry;
    let savedListing = await newlisting.save();
    req.flash("success","New listing created Successfully!");
    res.redirect("/listings");    
}

module.exports.editForm = async (req, res)=>{
     let { id } = req.params;
    const foundlisting = await listing.findById(id);
    if(!foundlisting){
        req.flash("error", "Listing does`t Exists!!");
       return res.redirect("/listings");
    }

    foundlisting.image.url = foundlisting.image.url.replace(
    "/upload",
    "/upload/h_150,w_150/e_blur:80"
);
    res.render("listings/edit.ejs", {listing: foundlisting});
}

module.exports.updateListing = async(req,res)=>{
    let{id} = req.params;
   let  updatedlisting = await listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename =  req.file.filename;
        updatedlisting .image = { url, filename};
        await updatedlisting .save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.distroyListing = async(req,res)=>{
    let { id } = req.params;
   await listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
}