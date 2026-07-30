const db = require('../config/db');

exports.getPageRights = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: User identifier missing from session context.' 
      });
    }

    const query = `
      SELECT DISTINCT sr.right_code, sr.right_type 
      FROM system_rights sr
      JOIN group_rights gr ON sr.id = gr.right_id
      JOIN user_group_mappings ugm ON gr.group_id = ugm.group_id
      WHERE ugm.user_id = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    
    // Flat array of right codes for fast frontend checking (e.g., ['NAV_METRICS', 'BTN_POST_ATTENDANCE'])
    const rightsList = rows.map(r => r.right_code);

    return res.status(200).json({
      success: true,
      rights: rightsList,
      rightsMeta: rows // Optional: Full metadata breakdown if required by advanced frontend layout engines
    });
  } catch (err) {
    console.error('Error in getPageRights:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to resolve system permissions from database.' 
    });
  }
};