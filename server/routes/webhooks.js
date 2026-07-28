const express = require('express');
const router = express.Router();

router.post('/paystack', async (req, res) => {
  try {
    const event = req.body;

    if (event && event.event === 'charge.success') {
      const data = event.data;
      const metadata = data.metadata || {};
      const email = data.customer.email;

      console.log(`Payment confirmed for $. Processing Telnyx number order...`);

      // Call Telnyx API to order a phone number automatically
      const telnyxResponse = await fetch('https://api.telnyx.com/v2/phone_numbers_jobs/ordering', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.TELNYX_API_KEY || 'KEY_PLACEHOLDER'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_numbers: [{ country_code: 'US', features: ['sms', 'voice'] }]
        })
      });

      const telnyxData = await telnyxResponse.json();
      console.log('Telnyx Order Response:', telnyxData);

      return res.status(200).json({ received: true, provisioned: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook provisioning error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
