

const express = require('express');
const router = express.Router();

router.get('/about' , (req, res) => {
    res.json([
        {
            first_name: "Yuval" ,
            last_name: "Itzhak",
        },
        {
            first_name: "Matan" ,
            last_name: "Zror",
        }
    ])
})

module.exports = router;