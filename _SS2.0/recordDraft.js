/**
 * Record Draft Interface.
 * https://confluence.corp.netsuite.com/display/TC/Commerce+API+2.0+Exposure+in+SuiteScript+2.0#CommerceAPI2.0ExposureinSuiteScript2.0-ModuleN/commerce/recordDraft
 *
 * N/restricted/recordDraftBridge is defined by RecordDraftApi interface.
 *
 * @module N/recordDraft
 * @NApiVersion 2.x
 *
 */
function recordDraft() {}
/**
 * Saves new draft.
 *
 * @param {Object} options
 * @param {number} options.id Id of existing draft to overwrite.
 * @param {number} options.storeEmptyValues true/false whenever the empty values should be stored as well. When
 * specified, fields to store must be defined. Default is false.
 * @param {number} options.ttlDays Number of days when draft is valid. If not modified within this period, it may be
 * removed. Optional, default to 7 days.
 * @param {array} options.fields Array of field names to save. when empty, all fields are saved. Example ['name',
 *     'ddate']
 * @param {Object} options.sublistsFields Map of Arrays of fields sublists to save. When empty, all sublists are saved.
 * When defined on specified sublists are saved. When array is empty for sublist, all values from sublist are stored.
 * Example { 'item' : ['name', 'qty'] }.
 *
 * @param {record.Record} options.recordObject Record Object which should be saved as a draft.
 *
 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.recordObject is missing
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.id is not valid number
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.ttlDays is not valid number
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.fields is not valid array
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.recordObject is not record object
 * @throws {SuiteScriptError} RCRD_DRFT_DSNT_EXIST is record draft for update does not exist
 * @throws {SuiteScriptError} RCRD_DRFT_INVALID_TTL - when TTL is out of bounds.
 * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE - when record type is not supported
 * @throws {SuiteScriptError} NEITHER_ARGUMENT_DEFINED when options.storeEmptyValues=true and options.fields is not
 *     defined or is empty and options.sublistsFields do not define any field to store or not defined at all
 * @throws {SuiteScriptError} INVALID_FIELD_ID when invalid field id is specified in options.fields or
 *     options.sublistsFields
 * @throws {SuiteScriptError} SSS_INVALID_SUBLIST when invalid sublist id is passed in options.sublistsFields.
 *
 * @since 2019.1
 */
recordDraft.prototype.save = function(options) {};

/**
 * Loads existing draft.
 *
 * @param {Object} options
 * @param {number} options.id Id of existing draft (required)
 * @param {boolean} options.isDynamic returned record should be dynamic or deferred. true by default
 * @param {array} options.fields Array of field names to load. when empty, all fields are loaded. When
 *     non-stored/invalid fields are passed, this will be ignored by design.
 * @param {Object} options.sublistsFields Map of Arrays of fields sublists to load. When empty, all sublists are
 *     loaded.
 * When defined on specified sublists are loaded. When array is empty for sublist, all values from sublist are loaded.
 * Example { 'item' : ['name', 'qty'] }. When non-stored/invalid sublists/fields are passed, this will be ignored by design.
 * @param {boolean} options.resolveFieldDependencies automatically resolve field dependencies (restore order).
 * when fields are empty, this is by default true, when fields are specified, this is by default false and
 * fields are filled in order passed in fields array.
 *
 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.id is missing
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.id is not valid number
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.fields is not valid array
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.isDynamic is not boolean
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.resolveFieldDependencies is not boolean
 * @throws {SuiteScriptError} RCRD_DRFT_DSNT_EXIST is record draft does not exist
 * @since 2019.1
 */
recordDraft.prototype.load = function(options) {};

/**
 * Deletes existing draft.
 *
 * @param {Object} options
 * @param {number} options.id Id of existing draft (required)
 *
 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.id is missing
 * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if options.id is not valid number
 * @throws {SuiteScriptError} RCRD_DRFT_DSNT_EXIST is record draft does not exist
 *
 * @since 2019.1
 */
recordDraft.prototype['delete'] = function(options) {};

recordDraft = new recordDraft();
/**
 * @type {recordDraft}
 */
N.prototype.recordDraft = recordDraft;