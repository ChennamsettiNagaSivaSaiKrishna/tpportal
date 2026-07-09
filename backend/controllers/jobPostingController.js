const jobPostingModel = require("../models/jobPostingModel");

// Add Job Posting
exports.addJobPosting = async (req, res) => {
    try {

        const {
            drive_id,
            company_id,
            job_title,
            job_description,
            salary_package,
            eligibility_criteria,
            application_deadline
        } = req.body;

        await jobPostingModel.addJobPosting(
            drive_id,
            company_id,
            job_title,
            job_description,
            salary_package,
            eligibility_criteria,
            application_deadline,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Job Posting Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get All Job Postings
exports.getAllJobPostings = async (req, res) => {
    try {

        const jobPostings =
            await jobPostingModel.getAllJobPostings();

        res.json({
            success: true,
            jobPostings
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get Job Posting By ID
exports.getJobPostingById = async (req, res) => {
    try {

        const jobPosting =
            await jobPostingModel.getJobPostingById(
                req.params.id
            );

        res.json({
            success: true,
            jobPosting
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Update Job Posting
exports.updateJobPosting = async (req, res) => {
    try {

        const {
            drive_id,
            company_id,
            job_title,
            job_description,
            salary_package,
            eligibility_criteria,
            application_deadline
        } = req.body;

        await jobPostingModel.updateJobPosting(
            req.params.id,
            drive_id,
            company_id,
            job_title,
            job_description,
            salary_package,
            eligibility_criteria,
            application_deadline
        );

        res.json({
            success: true,
            message: "Job Posting Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Delete Job Posting
exports.deleteJobPosting = async (req, res) => {
    try {

        await jobPostingModel.deleteJobPosting(
            req.params.id
        );

        res.json({
            success: true,
            message: "Job Posting Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};