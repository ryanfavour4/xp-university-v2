class Validate {
  constructor() {
    this._errors = [];
  }

  get errors() {
    return this._errors;
  }

  /**
   * 
   * @param {string} value 
   * @param {int} min 
   * @param {int} max 
   * @param {string} param 
   * @returns {boolean} 
   */
  length(value, min, max, param) {
    if (value.length < min || value.length > max) {
      this._errors.push(`${param} length must be between ${min} and ${max}`);
      return false;
    }
    return true;
  }

  choseOne(value, param) {
    if (value == "") {
      this._errors.push(`Please select ${param}`);
      return false;
    }
    return true;
  }


  
}
