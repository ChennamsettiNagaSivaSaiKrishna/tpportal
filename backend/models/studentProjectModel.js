const db = require("../config/db");

// Add Project
exports.addProject = async (student_roll, title, description, project_url) => {
    const [result] = await db.execute(
        `INSERT INTO student_projects
        (student_roll,title,description,project_url)
        VALUES (?,?,?,?)`,
        [student_roll, title, description, project_url]
    );
    return result;
};

// Get Student Projects
exports.getStudentProjects = async (student_roll) => {
    const [rows] = await db.execute(
        `SELECT * FROM student_projects WHERE student_roll=?`,
        [student_roll]
    );
    return rows;
};

// Get All Projects
exports.getAllProjects = async () => {
    const [rows] = await db.execute(
        `SELECT * FROM student_projects`
    );
    return rows;
};

// Update Project
exports.updateProject = async (id, title, description, project_url) => {
    const [result] = await db.execute(
        `UPDATE student_projects
         SET title=?,description=?,project_url=?
         WHERE id=?`,
        [title, description, project_url, id]
    );
    return result;
};

// Delete Project
exports.deleteProject = async (id) => {
    const [result] = await db.execute(
        `DELETE FROM student_projects WHERE id=?`,
        [id]
    );
    return result;
};