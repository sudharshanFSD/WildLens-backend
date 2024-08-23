const express = require('express');
const router = express.Router();

const content = {
  intro: "At WildLens, we are dedicated to providing unparalleled wildlife tour experiences. Our commitment to excellence ensures that every journey is not just a tour but a transformative experience.",
  sections: [
    {
      title: "Expert Guides",
      description: "Our team of expert guides are passionate wildlife enthusiasts with extensive knowledge and experience. They provide insightful commentary and ensure you have an unforgettable experience."
    },
    {
      title: "Sustainable Practices",
      description: "We prioritize sustainability in all our tours. Our practices minimize environmental impact and contribute to the conservation of wildlife and habitats."
    },
    {
      title: "Customized Itineraries",
      description: "Whether you’re seeking an adventurous safari or a serene nature retreat, we offer personalized itineraries that cater to your interests and preferences."
    },
    {
      title: "Exceptional Service",
      description: "From the moment you contact us until the end of your tour, our team is dedicated to providing exceptional service and ensuring your satisfaction."
    },
    {
      title: "Customer Service",
      description: "Our customer service team is available 24/7 to assist you with any inquiries or issues. We are committed to making your experience seamless and enjoyable from start to finish."
    },
    {
      title: "Exclusive Destinations",
      description: "We offer access to exclusive destinations and hidden gems that are off the beaten path. Our tours take you to unique locations where you can witness wildlife in its most pristine and untouched environments."
    }
  ]
};

// GET endpoint for content
router.get('/', (req, res) => {
  res.json(content);
});

module.exports = router;
