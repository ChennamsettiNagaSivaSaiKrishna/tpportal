const offerModel = require("../models/offerModel");

// ======================================
// Add Offer
// ======================================
exports.addOffer = async (req, res) => {

    try {

        const {
            drive_id,
            student_roll,
            package_offered,
            offer_letter_url
        } = req.body;

        await offerModel.addOffer(
            drive_id,
            student_roll,
            package_offered,
            offer_letter_url
        );

        res.status(201).json({
            success: true,
            message: "Offer Added Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ======================================
// Get Student Offers
// ======================================
exports.getStudentOffers = async (req, res) => {

    try {

        const offers =
            await offerModel.getStudentOffers(
                req.params.student_roll
            );

        res.json({
            success: true,
            offers
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ======================================
// Get All Offers
// ======================================
exports.getAllOffers = async (req, res) => {

    try {

        const offers =
            await offerModel.getAllOffers();

        res.json({
            success: true,
            offers
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ======================================
// Update Offer
// ======================================
exports.updateOffer = async (req, res) => {

    try {

        const {
            package_offered,
            offer_letter_url
        } = req.body;

        await offerModel.updateOffer(
            req.params.id,
            package_offered,
            offer_letter_url
        );

        res.json({
            success: true,
            message: "Offer Updated Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ======================================
// Student Accept / Reject Offer
// ======================================
exports.acceptOffer = async (req, res) => {

    try {

        const {
            is_accepted_by_student
        } = req.body;

        await offerModel.acceptOffer(
            req.params.id,
            is_accepted_by_student
        );

        res.json({
            success: true,
            message: "Offer Status Updated Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ======================================
// Delete Offer
// ======================================
exports.deleteOffer = async (req, res) => {

    try {

        await offerModel.deleteOffer(
            req.params.id
        );

        res.json({
            success: true,
            message: "Offer Deleted Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};