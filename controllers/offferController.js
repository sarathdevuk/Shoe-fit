const asyncHandler = require("express-async-handler");
const { image } = require("../config/cloudinary");
const Offer = require("../model/offerModel");
const cloudinary = require("../config/cloudinary")

const offerController = {
  addOffer: asyncHandler(async (req, res) => {

    try {
      const { name, description } = req.body

     let image = req.files.image[0]

      let imageFile = await cloudinary.uploader.upload(image.path, { folder: 'Shopfit' })
      image = imageFile;

      const offer = new Offer({
        name,
        description,
        image,
      });

      const savedOffer = await offer.save();
  
      res.redirect("/admin/offer")

    } catch (err) {
      console.log(err);
      res.status(404)
      throw new Error("not found")
    }
  }),

  getOffer: asyncHandler(async (req, res) => {
    try {

      const offer = await Offer.find().lean()

      res.render("admin/bannerManagement", { offer })
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }

  }),
  getAddOffer: asyncHandler(async (req, res) => {
    res.render("admin/addBanner")

  }),
  getEditOffer: asyncHandler(async (req, res) => {
    try {
      const offer = await Offer.findById(req.params.id).lean()

      console.log(offer);
      res.render("admin/editBanner", { offer })

    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found")
    }

  }),


  updateOffer: asyncHandler(async (req, res) => {

    const { name, description, discount, startDate, endDate } = req.body
    const id = req.params.id
    try {
      
      
      let image = req.files?.image?.[0];

      if (image) {
        let imageFile = await cloudinary.uploader.upload(image.path, { folder: 'Shopfit' });
        image = imageFile;
      }
    
      
      console.log("kjdfkjfdshgshgfshgkjj",image);


      const updatedOffer = await Offer.updateOne({ _id: id },
        {
          $set:
          {
            name, description,
            image: image,
          }
        })

      console.log(updatedOffer);
      res.redirect("/admin/offer")


    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("not found");

    }

  }),
  deleteOffer: asyncHandler(async (req, res) => {
    // res.json({mesf: "done"})
    try {
      const deletedOffer = await offer.remove(req.params.id)
      res.status(200).json(deletedOffer)
    } catch (error) {
      console.log(error);
    }

  }),
  listOffer: asyncHandler(async (req, res) => {

    try {

      const offer = await Offer.findByIdAndUpdate(req.params.id,
        {
          $set: { unlist: false }
        }, { new: true })

      res.redirect("/admin/offer")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("cant update")
    }

  }),
  unlistOffer: asyncHandler(async (req, res) => {
    try {
      const offer = await Offer.findByIdAndUpdate(req.params.id,
        {
          $set: { unlist: true }
        }, { new: true })

      res.redirect("/admin/offer")
    } catch (error) {
      console.log(error);
      res.status(404)
      throw new Error("cant update")
    }
  }),

}


module.exports = offerController;