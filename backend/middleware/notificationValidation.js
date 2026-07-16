const validateCreateNotification = (req, res, next) => {

    const {

        title,
        message,
        recipients

    } = req.body;

    if (!title || title.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Title is required."

        });

    }

    if (!message || message.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Message is required."

        });

    }

    if (!Array.isArray(recipients) || recipients.length === 0) {

        return res.status(400).json({

            success: false,

            message: "Please select at least one recipient."

        });

    }

    next();

};

module.exports = {

    validateCreateNotification

};