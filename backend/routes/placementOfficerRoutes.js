const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ message: "Placement Officer Route Working" });
});

module.exports = router;