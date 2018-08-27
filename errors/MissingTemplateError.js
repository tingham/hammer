const TAG = "Errors"

class MissingTemplateError extends Error {
  constructor(...params) {
    super(params)
    this.code = 500
    this.message = "Template required to render this view is missing"
  }
}

module.exports = MissingTemplateError
