export default class Voucher {
  constructor({
    name = null,
    code = null,
    variant = null,
    amount = null,
    currency = null,
    expiresAt = null,
    price = null,
    availableStock = null,
    status = true,
  } = {}) {
    this.name = name;
    this.price = price;
    this.code = code;
    this.variant = variant;
    this.amount = amount;
    this.currency = currency;
    this.expiresAt = expiresAt;
    this.price = price;
    this.availableStock = availableStock;
    this.status = status;
  }
}
