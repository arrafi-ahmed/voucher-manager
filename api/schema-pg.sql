CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    role       SMALLINT CHECK (role IN (10, 20)), -- 10=admin, 20=customer
    name       VARCHAR(255)        NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   TEXT                NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vouchers
(
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255)       NOT NULL,
    description     TEXT,
    code            VARCHAR(32) UNIQUE NOT NULL,
    variant         INTEGER   DEFAULT 0 CHECK (variant IN (0, 1, 2)), -- 0=amount, 1=percentage
    amount          INTEGER            NOT NULL,                      -- e.g. 100 ZAR or 10%
    expires_at      TIMESTAMP,
    price           DECIMAL(10, 2)     NOT NULL,
    available_stock INT       default 1,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    user_id         INT REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE purchases
(
    id                    SERIAL PRIMARY KEY,
    purchased_price       DECIMAL(10, 2) NOT NULL,
    is_redeemed              BOOLEAN   DEFAULT FALSE,
    payment_status        SMALLINT CHECK (payment_status IN (0, 1, 2)), -- 0=pending, 1=paid, 2=failed
    stripe_payment_intent_id VARCHAR(255) unique,
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW(),
    user_id               INT REFERENCES users (id) ON DELETE CASCADE,
    voucher_id            INT REFERENCES vouchers (id) ON DELETE CASCADE
);

CREATE TABLE password_reset
(
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    user_id    INT REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
