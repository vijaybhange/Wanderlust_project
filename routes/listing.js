const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});

const listingController = require("../controllers/listings.js");

// NEW ROUTE 
router.get("/new", isLoggedIn, listingController.renderNewForm );

router.route("/")
.get( wrapAsync(listingController.index))
.post( isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner,  upload.single('listing[image]'),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,  isOwner, wrapAsync(listingController.distroyListing));


// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editForm));

module.exports = router;











// index route 
// router.get("/", wrapAsync(listingController.index));

// // show route
// router.get("/:id", wrapAsync(listingController.showListing));

// // create route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// // Update route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// // Delete Route
// router.delete("/:id",isLoggedIn,  isOwner, wrapAsync(listingController.distroyListing));