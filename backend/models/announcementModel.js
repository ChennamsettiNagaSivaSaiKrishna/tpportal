const db = require("../config/db");

// Add Announcement
exports.addAnnouncement = async (
    sender_id,
    target_type,
    target_batch_id,
    title,
    message
) => {

    const [result] = await db.execute(
        `INSERT INTO announcements
        (
            sender_id,
            target_type,
            target_batch_id,
            title,
            message
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            sender_id,
            target_type,
            target_batch_id,
            title,
            message
        ]
    );

    return result;
};

// Get All Announcements
exports.getAllAnnouncements = async () => {

    const [rows] = await db.execute(
        `SELECT a.*,
                u.email
         FROM announcements a
         JOIN users u
           ON a.sender_id = u.id
         ORDER BY a.id DESC`
    );

    return rows;
};

// Get Announcement By ID
exports.getAnnouncementById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM announcements
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// Update Announcement
exports.updateAnnouncement = async (
    id,
    target_type,
    target_batch_id,
    title,
    message
) => {

    const [result] = await db.execute(
        `UPDATE announcements
         SET
            target_type = ?,
            target_batch_id = ?,
            title = ?,
            message = ?
         WHERE id = ?`,
        [
            target_type,
            target_batch_id,
            title,
            message,
            id
        ]
    );

    return result;
};

// Delete Announcement
exports.deleteAnnouncement = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM announcements
         WHERE id = ?`,
        [id]
    );

    return result;
};