/**
 * SuiteScript module
 *
 * @module N/certificateControl
 * @NApiVersion 2.x
 *
 */
function certificateControl() {}
/**
 * Returns a list of signing certificates available to the user the script is run under.
 * @governance 10 units
 * @param {Object} options
 * @param {Number} options.subsidiary (optional) filter
 * @param {String} options.type (optional) filter
 *
 * @returns {Object} metadata about certificate
 */
function findCertificates() {
}

certificateControl = new certificateControl();
/**
 * @type {certificateControl}
 */
N.prototype.certificateControl = certificateControl;