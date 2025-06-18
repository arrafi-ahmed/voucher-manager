export default class Voucher {
  constructor({
    name = null,
    description = null,
    code = null,
    variant = null,
    amount = null,
    expiresAt = null,
    price = null,
    availableStock = null,
  } = {}) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.code = code;
    this.variant = variant;
    this.amount = amount;
    this.expiresAt = expiresAt;
    this.price = price;
    this.availableStock = availableStock;
  }
}
