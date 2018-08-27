const TAG = "Errors"

class NotFoundError extends Error {
  constructor(...params) {
    super(params)
    this.code = 404
    this.message = "The required resource could not be found."
  }
}

module.exports = NotFoundError
