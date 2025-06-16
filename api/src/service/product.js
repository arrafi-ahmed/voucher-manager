const {sql} = require("../db");
const {v4: uuidv4} = require("uuid");
const {removeFiles} = require("../helpers/util");
const CustomError = require("../model/CustomError");

exports.upsertProduct = async ({payload}) => {
    const [savedProduct] = await sql`
        insert into products ${sql(payload)} on conflict(id)
        do
        update set ${sql(payload)}
            returning *`;
    return savedProduct;
};

exports.getProductsByUserId = async ({
                                         payload: {offset, limit, fetchTotalCount, userId},
                                     }) => {
    const offsetValue = offset || 0; // Default offset
    const limitValue = limit || 10; // Default limit
    fetchTotalCount = fetchTotalCount || true;

    // @formatter:off
  const result = await sql`
    SELECT
      p.*,
      p.id AS p_id,    
      p.created_at AS created_at,
      json_agg(
        json_build_object(
            'id', pi.id,
            'identity_type', pi.identity_type,
            'identity_no', pi.identity_no,
            'uuid', pi.uuid
        )
      ) FILTER (WHERE pi.id IS NOT NULL) as product_identities
    FROM
      products p
        LEFT JOIN product_identities pi ON p.id = pi.product_id
    WHERE
      p.user_id = ${userId}
    GROUP BY
      p.id
    ORDER BY
      p.id DESC
      LIMIT ${limitValue}
    OFFSET ${offsetValue}`;

  if (!fetchTotalCount) return { list: result };

  const [count] = await sql`
        SELECT COUNT(DISTINCT p.id) AS total
        FROM
          products p
                LEFT JOIN product_identities pi ON p.id = pi.product_id
        WHERE
          p.user_id = ${userId}
    `;
  // @formatter:on
    return {list: result, totalCount: count.total || 0};
};