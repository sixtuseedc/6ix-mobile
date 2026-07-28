const express = require('express');
const router = express.Router();

router.post('/purchase-extra', async (req, res) => {
  try {
    const { userId, planId } = req.body;
    const extraPrice = 299;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'customer@6ixmobile.com',
        amount: extraPrice * 100,
        metadata: {
          type: 'extra_number',
          user_id: userId,
          plan_id: planId
        }
      })
    });

    const data = await response.json();
    if (data.status) {
      return res.json({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference
      });
    } else {
      return res.status(400).json({ success: false, message: data.message || 'Failed to initialize extra number purchase.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
