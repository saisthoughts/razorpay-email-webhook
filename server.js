// import express from 'express';
// import bodyParser from 'body-parser';
// import { createHmac } from 'crypto';
// import { createTransport } from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// app.use(bodyParser.json({
//   verify: (req, res, buf) => {
//     if (buf && buf.length) {
//       req.rawBody = buf.toString();
//     }
//   }
// }));

// const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// // Configure Nodemailer transporter
// const transporter = createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // Helper function to verify Razorpay signature
// function verifySignature(body, signature) {
//   if (!body) {
//     console.error('Error: No body received for signature verification.');
//     return false;
//   }

//   const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
//     .update(body)
//     .digest('hex');

//   return expectedSignature === signature;
// }

// // Webhook endpoint
// app.post('/api/webhook', (req, res) => {
//   const razorpaySignature = req.headers['x-razorpay-signature'];

//   console.log("Raw body received:", req.rawBody);
//   console.log("Signature received:", razorpaySignature);

//   if (!verifySignature(req.rawBody, razorpaySignature)) {
//     console.error('Invalid signature');
//     return res.status(400).send('Invalid signature');
//   }

//   const payload = req.body;
//   console.log('Received webhook:', payload);

//   if (payload.event === 'payment.captured') {
//     const paymentData = payload.payload.payment.entity;
//     console.log("Email Address is - ", paymentData.email);

//     const payerEmail = paymentData.email || process.env.EMAIL_DEFAULT;

//     // Email setup
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: payerEmail,
//       subject: 'Payment Successful',
//       text: `Hi there,\n\nYour payment of Rs. ${paymentData.amount / 100} was successful. Thank you for your purchase!
//       \n\n This is Your Link to the 800+ EBooks : ${process.env.GOOGLE_DRIVE_LINK}
//       \n\nRegards,\nShri Enterprise`
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//       } else {
//         console.log('Email sent:', info.response);
//       }
//     });
//   }

//   res.status(200).send('OK');
// });

// // **Export the app as a handler for Vercel**
// export default app;


import express from 'express';
import bodyParser from 'body-parser';
import { createHmac } from 'crypto';
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString();
    }
  }
}));

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Configure Nodemailer transporter
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to verify Razorpay signature
function verifySignature(body, signature) {
  if (!body) {
    console.error('Error: No body received for signature verification.');
    return false;
  }

  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Webhook endpoint
app.post('/api/webhook', (req, res) => {
  const razorpaySignature = req.headers['x-razorpay-signature'];

  console.log("Raw body received:", req.rawBody);
  console.log("Signature received:", razorpaySignature);

  if (!verifySignature(req.rawBody, razorpaySignature)) {
    console.error('Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  const payload = req.body;
  console.log('Received webhook:', payload);

  if (payload.event === 'payment.captured') {
    const paymentData = payload.payload.payment.entity;
    console.log("Email Address is - ", paymentData.email);

    const payerEmail = paymentData.email || process.env.EMAIL_DEFAULT;

    // Email setup
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: payerEmail,
      subject: 'Payment Successful',
      text: `Hi there,\n\nYour payment of Rs. ${paymentData.amount / 100} was successful. Thank you for your purchase!
      \n\n This is Your Link to the 800+ EBooks : ${process.env.GOOGLE_DRIVE_LINK}
      \n\nRegards,\nShri Enterprise`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }

  res.status(200).send('OK');
});

// Start the server (important for Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
