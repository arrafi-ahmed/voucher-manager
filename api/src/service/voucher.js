const { sql } = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { defaultCurrency, generateShortId } = require("../helpers/util");

exports.save = async (payload) => {
  // This function only handles new voucher creation, not updates
  if (payload.id) {
    throw new Error('Use updateStatusAndName for editing existing vouchers');
  }

  try {
    // Prepare Stripe coupon parameters (no name field, only id)
    const couponParams = {
      duration: 'once',
    };

    // Map variant to Stripe coupon type
    if (payload.variant === 1) {
      // Percentage discount
      couponParams.percent_off = payload.amount;
    } else {
      // Amount discount (variant 0 or 2)
      couponParams.amount_off = payload.amount;
      couponParams.currency = payload.currency || defaultCurrency.code;
    }

    // Add expiration if provided
    if (payload.expires_at) {
      couponParams.redeem_by = Math.floor(new Date(payload.expires_at).getTime() / 1000);
    }

    // Add max redemptions based on available stock
    if (payload.available_stock && payload.available_stock > 0) {
      couponParams.max_redemptions = payload.available_stock;
    }

    // Create new coupon with short unique ID
    const shortCouponId = generateShortId();
    couponParams.id = shortCouponId;
    
    const stripeCoupon = await stripe.coupons.create(couponParams);
    const stripeCouponId = stripeCoupon.id;

    // Create new Stripe promotion code
    const promotionParams = {
      coupon: stripeCouponId,
      code: payload.code, // Use voucher code as promotion code
      active: payload.status !== false, // Set active based on voucher status
    };

    const stripePromotion = await stripe.promotionCodes.create(promotionParams);
    const stripePromotionId = stripePromotion.id;

    // Add the Stripe IDs to the payload
    payload.stripe_coupon_id = stripeCouponId;
    payload.stripe_promotion_id = stripePromotionId;

  } catch (error) {
    console.error('Failed to create Stripe coupon/promotion:', error);
    throw new Error(`Failed to create Stripe coupon/promotion: ${error.message}`);
  }

  // Save voucher to database
  const [savedVoucher] = await sql`
    insert into vouchers ${sql(payload)} returning *`;
  return savedVoucher;
};

// New method for updating only status and name (restricted editing)
exports.updateStatusAndName = async (payload) => {
  const { id, name, status } = payload;
  
  if (!id) {
    throw new Error('Voucher ID is required for update');
  }

  // Get existing voucher
  const [existingVoucher] = await sql`
    SELECT stripe_promotion_id FROM vouchers WHERE id = ${id}
  `;

  if (!existingVoucher) {
    throw new Error('Voucher not found');
  }

  try {
    // Update promotion code status if it exists
    if (existingVoucher.stripe_promotion_id) {
      await stripe.promotionCodes.update(existingVoucher.stripe_promotion_id, { 
        active: status !== false 
      });
    }

    // Update voucher in database (only name and status)
    const [updatedVoucher] = await sql`
      UPDATE vouchers 
      SET name = ${name}, 
          status = ${status}, 
          updated_at = NOW()
      WHERE id = ${id} 
      RETURNING *
    `;

    return updatedVoucher;
  } catch (error) {
    console.error('Failed to update voucher status/name:', error);
    throw new Error(`Failed to update voucher: ${error.message}`);
  }
};

exports.reduceStock = async ({ voucherId }) => {
  const [updatedVoucher] = await sql`
    UPDATE vouchers
    SET available_stock = available_stock - 1,
        updated_at      = NOW()
    WHERE id = ${voucherId}
      AND available_stock > 0 RETURNING *;
  `;
  return updatedVoucher; // will be undefined if stock was 0
};

exports.getVoucher = async ({ voucherId }) => {
  const [voucher] = await sql`
    select *
    from vouchers
    where id = ${voucherId}`;

  return voucher;
};

exports.getActiveVouchers = async () => {
  const vouchers = await sql`
    SELECT *
    FROM vouchers
    WHERE (expires_at IS NULL OR expires_at > NOW())
      AND available_stock > 0`;

  return vouchers;
};

exports.getPurchasesWUsersForOwnVouchers = async ({
  offset,
  limit,
  fetchTotalCount,
  userId,
}) => {
  const offsetValue = offset || 0; // Default offset
  const limitValue = limit || 10; // Default limit
  fetchTotalCount = fetchTotalCount || true;

  const result = await sql`
    SELECT p.*,
           v.*,
           v.name            AS voucher_name,
           u.name            AS user_name,
           p.purchased_price AS purchased_price,
           p.is_redeemed     AS is_redeemed,
           p.created_at      AS created_at
    FROM purchases p
           join vouchers v on p.voucher_id = v.id
           join users u on p.user_id = u.id
    WHERE v.user_id = ${userId}
    ORDER BY p.id DESC
      LIMIT ${limitValue}
    OFFSET ${offsetValue}`;

  if (!fetchTotalCount) return { items: result };

  const [count] = await sql`
    SELECT COUNT(DISTINCT p.id) AS total
    FROM purchases p
           join vouchers v on p.voucher_id = v.id
    WHERE v.user_id = ${userId}
  `;

  return { items: result, total: count.total || 0 };
};

exports.getPurchasesWVouchers = async ({
  offset,
  limit,
  fetchTotalCount,
  userId,
}) => {
  const offsetValue = offset || 0; // Default offset
  const limitValue = limit || 10; // Default limit
  fetchTotalCount = fetchTotalCount || true;

  const result = await sql`
    SELECT p.*,
           p.purchased_price AS purchased_price,
           p.is_redeemed     AS is_redeemed,
           p.created_at      AS created_at,
           v.*,
           v.name            AS voucher_name
    FROM purchases p
           join vouchers v on p.voucher_id = v.id
    WHERE p.user_id = ${userId}
    ORDER BY p.id DESC
      LIMIT ${limitValue}
    OFFSET ${offsetValue}`;

  if (!fetchTotalCount) return { items: result };

  const [count] = await sql`
    SELECT COUNT(DISTINCT p.id) AS total
    FROM purchases p
           join vouchers v on p.voucher_id = v.id
    WHERE p.user_id = ${userId}
  `;

  return { items: result, total: count.total || 0 };
};

exports.getVouchersByUserId = async ({
  offset,
  limit,
  fetchTotalCount,
  userId,
}) => {
  const offsetValue = offset || 0; // Default offset
  const limitValue = limit || 10; // Default limit
  fetchTotalCount = fetchTotalCount || true;

  // @formatter:off
  const result = await sql`
    SELECT
      *
    FROM
      vouchers        
    WHERE
      user_id = ${userId}    
    ORDER BY
      id DESC
      LIMIT ${limitValue}
    OFFSET ${offsetValue}`;

  if (!fetchTotalCount) return { items: result };

  const [count] = await sql`
        SELECT COUNT(DISTINCT id) AS total
        FROM
          vouchers                
        WHERE
          user_id = ${userId}
    `;
  // @formatter:on
  return { items: result, total: count.total || 0 };
};

exports.removeVoucher = async ({ voucherId }) => {
  // First get the voucher to check if it has Stripe IDs
  const [voucher] = await sql`
    SELECT stripe_coupon_id, stripe_promotion_id FROM vouchers WHERE id = ${voucherId}
  `;

  // Delete the Stripe promotion code if it exists
  if (voucher && voucher.stripe_promotion_id) {
    try {
      await stripe.promotionCodes.update(voucher.stripe_promotion_id, { active: false });
    } catch (error) {
      console.error('Failed to deactivate Stripe promotion code:', error);
      // Continue with deletion even if promotion code deactivation fails
    }
  }

  // Delete the Stripe coupon if it exists
  if (voucher && voucher.stripe_coupon_id) {
    try {
      await stripe.coupons.del(voucher.stripe_coupon_id);
    } catch (error) {
      console.error('Failed to delete Stripe coupon:', error);
      // Continue with voucher deletion even if Stripe coupon deletion fails
    }
  }

  // Delete the voucher from database
  const [result] = await sql`
    DELETE 
    FROM vouchers
    WHERE id = ${voucherId} returning *
  `;
  return result;
};

// New method for voucher verification
exports.verifyVoucherPurchase = async ({ email, voucherCode }) => {
  // First check if user exists with this email
  const [user] = await sql`
    SELECT id, name, email FROM users WHERE email = ${email}
  `;

  if (!user) {
    throw new Error('User not found with this email');
  }

  // Check if voucher exists with this code
  const [voucher] = await sql`
    SELECT id, name, code, status, available_stock FROM vouchers WHERE code = ${voucherCode}
  `;

  if (!voucher) {
    throw new Error('Voucher not found with this code');
  }

  if (!voucher.status) {
    throw new Error('Voucher is inactive');
  }

  // Check if user has purchased this voucher
  const [purchase] = await sql`
    SELECT id, purchased_price, is_redeemed, payment_status, created_at 
    FROM purchases 
    WHERE user_id = ${user.id} AND voucher_id = ${voucher.id}
  `;

  if (!purchase) {
    throw new Error('No purchase found for this user and voucher');
  }

  if (purchase.payment_status !== 1) {
    throw new Error('Purchase payment not completed');
  }

  if (purchase.is_redeemed) {
    throw new Error('Voucher already redeemed');
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    voucher: {
      id: voucher.id,
      name: voucher.name,
      code: voucher.code
    },
    purchase: {
      id: purchase.id,
      purchasedPrice: purchase.purchased_price,
      isRedeemed: purchase.is_redeemed,
      paymentStatus: purchase.payment_status,
      createdAt: purchase.created_at
    },
    isValid: true
  };
};

// Mark voucher as redeemed (for external app integration)
exports.markVoucherAsRedeemed = async ({ email, voucherCode }) => {
  // First verify the voucher purchase
  const verification = await exports.verifyVoucherPurchase({ email, voucherCode });
  
  if (!verification.isValid) {
    throw new Error('Voucher verification failed');
  }

  // Mark as redeemed
  const [updatedPurchase] = await sql`
    UPDATE purchases 
    SET is_redeemed = true, updated_at = NOW()
    WHERE id = ${verification.purchase.id}
    RETURNING *
  `;

  return {
    ...verification,
    purchase: {
      ...verification.purchase,
      isRedeemed: true
    },
    redeemedAt: new Date()
  };
};