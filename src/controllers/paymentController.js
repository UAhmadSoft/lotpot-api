const Client = require('../models/Client');
const stripe = require('../utils/stripe');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handleWebhook = async (req, res) => {
  console.log('Webhook Event Received');
  const sig = req.headers['stripe-signature'];

  console.log('req.body', req.body);
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('err', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const data = event.data.object;
  console.log('data', data);
  console.log('event.type', event.type);
  switch (event.type) {
    case 'account.updated':
      console.log('account.updated');
      const user = await Client.findOneAndUpdate(
        { email: data.email },
        {
          stripeAccount: {
            id: data.id,
            charges_enabled: data.charges_enabled,
            details_submitted: data.details_submitted,
            capabilities: data.capabilities,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      console.log('user', user);
      // Then define and call a function to handle the event account.updated
      break;
    case 'account.application.deauthorized':
      console.log('account.application.deauthorized');

      // Then define and call a function to handle the event account.application.deauthorized
      break;
    case 'checkout.session.completed':
      console.log('checkout.session.completed');

      // Then define and call a function to handle the event checkout.session.completed
      break;
    case 'payment_intent.payment_failed':
      console.log('payment_intent.payment_failed');

      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.succeeded':
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case 'payout.failed':
      console.log('payout.failed');

      // Then define and call a function to handle the event payout.failed
      break;
    case 'payout.paid':
      console.log('payout.paid');

      // Then define and call a function to handle the event payout.paid
      break;
    case 'transfer.failed':
      console.log('transfer.failed', transfer.failed);

      // Then define and call a function to handle the event transfer.failed
      break;
    case 'transfer.paid':
      console.log('transfer.paid');

      // Then define and call a function to handle the event transfer.paid
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 res to acknowledge receipt of the event
  res.send();
};
