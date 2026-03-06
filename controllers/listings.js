const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
      .populate({path:"reviews",populate:{path:"author"}})
      .populate("owner");

    if(!listing){
        req.flash("error", "Cannot find that listing");
        return res.redirect("/listings");  // ✅ RETURN
    }

    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res) => {
   let responce = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send()
  
   

   let url = req.file.path;
   let filename = req.file.filename;
      const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
     newListing.image = { url, filename};

    newListing.geometry = responce.body.features[0].geometry;

    let savedListing = await newListing.save();
   console.log(savedListing)
    req.flash("success", "New listing is created");
     return res.redirect("/listings");
  };


  module.exports.renderEditForm = async (req,res)=>{
      let {id} = req.params;
      
      const listing = await Listing.findById(id);
      if(!listing){
        req.flash("error", "Listing you requested does not exit");
       return res.redirect("/listings");
      }
      let originalImageUrl = listing.image.url;
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300,w_250")
      res.render("listings/edit.ejs", { listing, originalImageUrl });
  };


module.exports.updateListing = async (req,res)=>{
      
    let { id } = req.params;

    // update basic fields first
    let listing = await Listing.findById(id);

    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
    }

    Object.assign(listing, req.body.listing);

    // update image only if new file uploaded
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();

    req.flash("success", "Listing is updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res)=>{
          let {id} = req.params;
          let deletedListing = await Listing.findByIdAndDelete(id);
          console.log(deletedListing);
    req.flash("success", "Listing is deleted");

          res.redirect("/listings");
};