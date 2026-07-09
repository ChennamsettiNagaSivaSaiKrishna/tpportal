const projectModel = require("../models/studentProjectModel");

exports.addProject = async (req, res) => {
    try {
        const {
            student_roll,
            title,
            description,
            project_url
        } = req.body;

        await projectModel.addProject(
            student_roll,
            title,
            description,
            project_url
        );

        res.status(201).json({
            success: true,
            message: "Project Added Successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getStudentProjects = async (req, res) => {
    try {
        const projects = await projectModel.getStudentProjects(req.params.student_roll);

        res.json({
            success: true,
            projects
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await projectModel.getAllProjects();

        res.json({
            success: true,
            projects
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const {
            title,
            description,
            project_url
        } = req.body;

        await projectModel.updateProject(
            req.params.id,
            title,
            description,
            project_url
        );

        res.json({
            success: true,
            message: "Project Updated Successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.deleteProject = async (req, res) => {
    try {

        await projectModel.deleteProject(req.params.id);

        res.json({
            success: true,
            message: "Project Deleted Successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};