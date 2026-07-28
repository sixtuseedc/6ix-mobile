const express = require('express');
const router = express.Router();

const PLANS = {
  starter: { name: 'Starter / Burner Plan', amount: 499 },
  pro: { name: 'Pro / Personal Plan', amount: 799 },
  business: { name: 'Business / Team Plan', amount: 2499 }
};

router.post('/initialize', async (req, res) => {
  try {
    const { planId, email = 'customer@6ixmobile.com' } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected.' });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: plan.amount * 100,
        metadata: {
          plan_id: planId,
          plan_name: plan.name
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
      return res.status(400).json({ success: false, message: data.message || 'Payment initialization failed.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
