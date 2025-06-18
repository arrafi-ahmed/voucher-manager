const { sql } = require("../db");

exports.save = async (payload) => {
  const [savedVoucher] = await sql`
    insert into vouchers ${sql(payload)} on conflict(id)
        do
    update set ${sql(payload)}
      returning *`;
  return savedVoucher;
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
  // @formatter:off
  const [result] = await sql`
    DELETE 
    FROM vouchers
    WHERE v.id = ${voucherId} returning *
  `;
  // @formatter:on
  return result;
};