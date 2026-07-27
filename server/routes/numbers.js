const express = require('express');
const router = express.Router();
const telnyx = require('telnyx')(process.env.TELNYX_API_KEY);

// Search available phone numbers
router.get('/search', async (req, res) => {
  try {
    const { country_code = 'US', area_code } = req.query;
    
    const filter = {
      country_code: country_code,
      features: ['SMS', 'Voice'],
    };

    if (area_code) {
      filter.national_destination_code = area_code;
    }

    const response = await telnyx.availablePhoneNumbers.list({
      filter: filter,
      limit: 10,
    });

    res.json({ numbers: response.data });
  } catch (error) {
    console.error('Telnyx search error:', error);
    res.status(500).json({ error: error.message || 'Could not fetch numbers' });
  }
});

module.exports = router;
