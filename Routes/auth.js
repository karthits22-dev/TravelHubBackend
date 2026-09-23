const express = require('express');
const twilio = require('twilio');

const router = express.Router();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// SEND OTP
router.post('/send-otp', async (req, res) => {

  try {

    console.log('REQUEST BODY:', req.body);

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const verification =
      await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
          to: phone,
          channel: 'sms'
        });

    console.log('Twilio status:', verification.status);

    return res.json({
      success: true,
      message: 'OTP sent successfully',
      status: verification.status
    });

  } catch (error) {

    console.error('Twilio Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// VERIFY OTP
router.post('/verify-otp', async (req, res) => {

  try {

    console.log('VERIFY BODY:', req.body);

    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
    }

    const verificationCheck =
      await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({
          to: phone,
          code: otp
        });

    console.log(
      'Verification status:',
      verificationCheck.status
    );

    if (verificationCheck.status === 'approved') {

      return res.json({
        success: true,
        message: 'OTP verified successfully'
      });

    }

    return res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });

  } catch (error) {

    console.error('OTP Verification Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

module.exports = router;