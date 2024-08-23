const express = require('express');
const router = express.Router();

const quotes = [
    {
        quote:'The wild is not just a place but a feeling of freedom and adventure.',
        image: "/images/view.jpg"
    },
    {
      quote: "Discovering wildlife is about reconnecting with the raw beauty of the Earth.",
      image: "/images/falls.jpg"
    },
    {
      quote: "Every step in nature is a step towards serenity and wonder.",
      image: "/images/map.jpg"
    }
];

router.get('/quotes',(req,res)=>{
    res.json(quotes);
});

module.exports = router;