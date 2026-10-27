// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const listing = require("../models/listing.js");

// async function main() {
//     await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
// }

// main().then(() =>{
//     console.log("connection to db");
// }).catch((err) =>{
//      console.log(err);
// });

// const initDB = async () => {
//     await listing.deleteMany({});
//     await listing.insertMany(initData.data);
//     console.log("data was initialized");
// }

// initDB();



const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

console.log("Map token loaded:", Boolean(process.env.MAP_TOKEN));

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

const countryCodes = {
    "United States": "us",
    Italy: "it",
    Mexico: "mx",
    Switzerland: "ch",
    Tanzania: "tz",
    Netherlands: "nl",
    Fiji: "fj",
    "United Kingdom": "gb",
    Indonesia: "id",
    Canada: "ca",
    Thailand: "th",
    "United Arab Emirates": "ae",
    Greece: "gr",
    "Costa Rica": "cr",
    Japan: "jp",
    Maldives: "mv"
};

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("Connected to database");

    try {
        const listingsWithGeometry = [];

        // Geocode every listing before deleting anything.
        for (const obj of initData.data) {
            const countryCode = countryCodes[obj.country];

            const response = await geocodingClient.forwardGeocode({
                query: `${obj.location}, ${obj.country}`,
                ...(countryCode ? { countries: [countryCode] } : {}),
                limit: 1
            }).send();

            const feature = response.body.features[0];

            if (!feature) {
                throw new Error(
                    `Location not found: ${obj.location}, ${obj.country}. Existing listings were not deleted.`
                );
            }

            listingsWithGeometry.push({
                ...obj,
                owner: "6ad8e6471c4e72cc4777a1f2",
                geometry: {
                    type: "Point",
                    coordinates: feature.geometry.coordinates
                }
            });

            // console.log("Matched:", feature.place_name);
        }

        // Replace old data only after all locations are found.
        await Listing.deleteMany({});
        await Listing.insertMany(listingsWithGeometry);

        console.log("All listings initialized successfully!");
    } finally {
        await mongoose.connection.close();
    }
}

main().catch((err) => {
    console.error("Initialization failed:", err);
});
