const { sql } = require("../db");

exports.getAdminStats = async ({ userId }) => {
  // @formatter:off
  const [stats] = await sql`
    SELECT (SELECT COUNT(*)
            FROM vouchers
            WHERE user_id = ${userId}
              AND (expires_at IS NULL OR expires_at > NOW())
              AND available_stock > 0)                                        AS active_vouchers,
      COUNT(p.id) FILTER (WHERE p.payment_status = 1)                         AS total_sold,
      COUNT(p.id) FILTER (WHERE p.payment_status = 1 AND p.is_redeemed = true)   AS total_redeemed,
      COALESCE(SUM(p.purchased_price) FILTER (WHERE p.payment_status = 1), 0) AS total_revenue
    FROM purchases p
           JOIN vouchers v ON v.id = p.voucher_id
    WHERE v.user_id = ${userId};
  `;
  // @formatter:on
  return stats;
};
