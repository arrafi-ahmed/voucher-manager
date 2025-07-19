const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { sql } = require("../db");
const CustomError = require("../model/CustomError");
const voucherService = require("./voucher");
const userService = require("./user");
const { defaultCurrency } = require("../helpers/util");
const { sendPurchaseConfirmation } = require("./email");

exports.createPaymentIntent = async ({ payload: { voucherId, userId } }) => {
  const voucher = await voucherService.getVoucher({
    voucherId
  });
  if (!voucher) {
    throw new CustomError({ message: "Voucher not found" });
  } else if (voucher.availableStock < 1) {
    throw new CustomError({ message: "Voucher not available" });
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(voucher.price * 100),
    currency: defaultCurrency.code,
    metadata: {
      voucherId,
      userId,
      purchasedPrice: voucher.price,
    },
    automatic_payment_methods: { enabled: true }, // modern best practice
  });

  return { clientSecret: paymentIntent.client_secret, voucher };
};

exports.webhook = async (req) => {
  let data;
  let eventType;
  const isDev = process.env.NODE_ENV !== "production";
  // Check if webhook signing is configured.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isDev && !webhookSecret) {
    throw new CustomError({
      message: "Missing STRIPE_WEBHOOK_SECRET in production",
    });
  }
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error(err);
      throw new CustomError({ message: err.message, statusCode: 400, err });
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else if (isDev) {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  } else {
    throw new Error(
      "Invalid webhook configuration. Check environment and STRIPE_WEBHOOK_SECRET.",
    );
  }

  let responseMsg = "";
  switch (eventType) {
    case "payment_intent.succeeded":
      try {
        const paymentIntent = data.object;
        const metadata = paymentIntent.metadata;

        const userId = parseInt(metadata.userId, 10);
        const voucherId = parseInt(metadata.voucherId, 10);
        const purchasedPrice = parseFloat(metadata.purchasedPrice);

        // Step 2: Assign to purchase
        const purchase = {
          userId,
          voucherId,
          purchasedPrice,
          paymentStatus: 1,
          stripePaymentIntentId: paymentIntent.id,
        };

        const [savedPurchase] = await sql`
          INSERT INTO purchases ${sql(purchase)} ON CONFLICT(id) DO
          UPDATE SET ${sql(purchase)}
            RETURNING *`;

        // Step 4: Reduce voucher stock
        await voucherService.reduceStock({ voucherId });

        // Step 5: Send purchase confirmation
        // const user = await userService.getUserById({ id: userId });
        // const voucher = await voucherService.getVoucherOnly({
        //   payload: { voucherId },
        // });
        // sendPurchaseConfirmation({
        //   to: user.email,
        //   user,
        //   voucher,
        //   voucherIdentity: identity,
        //   purchase: savedPurchase,
        // }).catch((err) => {
        //   console.error("Failed to send purchase confirmation email:", err);
        // });

        responseMsg = "Purchase successful!";
        break;
      } catch (error) {
        console.error(error);
      }

    case "checkout.session.completed":
      try {
        const checkoutSession = data.object;
        
        // Check if promotion code was used
        if (checkoutSession.total_details && checkoutSession.total_details.amount_discount > 0) {
          // Promotion code was applied - find the voucher and mark as redeemed
          const promotionCode = checkoutSession.promotion_code;
          
          if (promotionCode && promotionCode.code) {
            // Find voucher by promotion code
            const [voucher] = await sql`
              SELECT id, stripe_promotion_id FROM vouchers 
              WHERE code = ${promotionCode.code}
            `;
            
            if (voucher && voucher.stripe_promotion_id === promotionCode.id) {
              // Find the purchase for this voucher and mark as redeemed
              await sql`
                UPDATE purchases 
                SET is_redeemed = true, updated_at = NOW()
                WHERE voucher_id = ${voucher.id} 
                AND payment_status = 1 
                AND is_redeemed = false
                LIMIT 1
              `;
              
              console.log(`Voucher ${promotionCode.code} marked as redeemed`);
            }
          }
        }
        
        responseMsg = "Checkout completed!";
        break;
      } catch (error) {
        console.error('Error handling checkout.session.completed:', error);
      }

    // // subscription created successfully
    // case "checkout.session.completed":
    //   const checkoutSessionCompleted = data.object;
    //
    //   responseMsg = "Purchase successful!";
    //   break;
    //
    // // fired immediately when customer cancel subscription
    // case "customer.subscription.updated":
    //   break;
    //
    // // fired at end of period when subscription expired
    // case "customer.subscription.deleted":
    //   break;
    //
    // // subscription auto renewal succeeded
    // case "invoice.paid":
    //   break;
    //
    // // subscription auto renewal failed
    // case "invoice.payment_failed":
    //   break;

    // ... handle other event types
    default:
      console.error(`Unhandled event type ${eventType}`);
  }

  return responseMsg;
};
/*
stripe trigger payment_intent.succeeded \
--override payment_intent:metadata.userId=1 \
--override payment_intent:metadata.voucherId=101 \
--override payment_intent:metadata.purchasedPrice=432
 */
