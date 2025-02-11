

const express = require('express');
const router = express.Router();

router.get('/about' , (req, res) => {
    res.json([
        {
            firstName: "Yuval" ,
            lastName: "Itzhak",
        },
        {
            firstName: "Matan" ,
            lastName: "Zror",
        }
    ])
})

module.exports = router;