const TAG = "Errors"

class HammerRequiresError extends Error {
  constructor(...params) {
    super(params)
    this.code = 500
    this.message = this.message + " Hammer requires additional configuration options to complete it's setup."
  }
}

module.exports = HammerRequiresError
