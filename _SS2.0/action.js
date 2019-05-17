/**
 * SuiteScript record action module
 *
 * @module N/action
 * @suiteScriptVersion 2.x
 */
function action() {}
/**
 * Performs a search for available record actions. If only the recordType parameter is provided, all actions available
 * for the record type are returned. If recordId is also provided, then only actions that qualify for execution on the
 * given record instance are returned. If id is provided, then only the action with the given ID is returned. In other
 * words, the recordId and id parameters act as additional filters and may result in an empty result set being returned.
 * If the recordId is provided than the returned actions are "qualified" and you don't have to provide the recordId
 * again when executing an Action object from the result set.
 * @param {Object} options
 * @param {string} options.recordType record type
 * @param {string} (optional) options.recordId record instance ID
 * @param {string} (optional) options.id action ID
 * @returns {Object} a set of actions (@see Action) defined on the record type indexed by action ID
 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.recordType is missing or undefined
 * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE if the specified record type doesn't exist
 * @throws {SuiteScriptError} SSS_INVALID_ACTION_ID if an action is specified and such action doesn't exist on the said record type
 * @throws {SuiteScriptError} RECORD_DOES_NOT_EXIST if a record ID is specified and that record instance doesn't exist
 */
action.prototype.find = function(options) {};
action.find.promise = function(options) {};

/**
 * Returns an executable record action for the given record type. If the recordId parameter is provided, then the
 * action object is only returned if the given record instance qualifies for execution of the given record action.
 * Also, if recordId is provided than the returned action is "qualified" and you don't have to provide the recordId
 * again when executing the Action object.
 * @param {Object} options
 * @param {string} options.recordType record type
 * @param {string} options.id action ID
 * @param {string} (optional) options.recordId record instance ID
 * @returns {Action} record action executor for action specified by options
 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.recordType or options.id is missing or undefined
 * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE if the specified record type doesn't exist
 * @throws {SuiteScriptError} SSS_INVALID_ACTION_ID if the specified action doesn’t exist on the said record type OR
 *                                                  the specified record instance does not qualify for executing the action
 * @throws {SuiteScriptError} RECORD_DOES_NOT_EXIST if a record ID is specified and that record instance doesn't exist
 */
action.prototype['get'] = function(options) {};
action['get'].promise = function(options) {};

/**
 * Executes a record action and returns its result.
 * @param {Object} options
 * @param {string} options.recordType record type
 * @param {string} options.id action ID
 * @param {Object} options.params action arguments
 * @param {string} options.params.recordId record instance ID
 * @returns {Object} action result; the actual return value returned by the action implementation is stored in the response property
 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.recordType or options.id or options.params.recordId is missing or undefined
 * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE if the specified record type doesn't exist
 * @throws {SuiteScriptError} SSS_INVALID_ACTION_ID if the specified action doesn't exist on the said record type
 * @throws {SuiteScriptError} RECORD_DOES_NOT_EXIST if the specified record instance doesn't exist
 */
action.prototype.execute = function(options) {};
action.execute.promise = function(options) {};

/**
 * Executes an asynchronous bulk record action and returns its task ID for later status inquiry. The options.params parameter
 * is mutually exclusive to options.condition and options.paramCallback.
 * @param {Object} options
 * @param {string} options.recordType record type
 * @param {string} options.id action ID
 * @param {Object[]} (optional) options.params array of parameter objects; each object corresponds to one record ID for which the action is to
 *                                             be executed; the object has the following form: {recordId: 1, someParam: 'foo', otherParam: 'bar'}
 *                                             recordId is always mandatory, other parameters are optional and specific to the particular action
 * @param {string} (optional) options.condition condition used to select record IDs for which the action is to be executed; only the
 *                                              action.ALL_QUALIFIED_INSTANCES constant is supported at the moment; it's name is self-explanatory
 * @param {string} (optional) options.paramCallback function that takes record ID and returns the parameter object for the given record ID
 * @returns {String} task ID used in a later call to getBulkStatus
 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.recordType or options.id is missing or undefined
 * @throws {SuiteScriptError} SSS_INVALID_RECORD_TYPE if the specified record type doesn't exist
 * @throws {SuiteScriptError} SSS_INVALID_ACTION_ID if the specified action doesn't exist on the said record type
 */
action.prototype.executeBulk = function(options) {};

/**
 * Returns the current status of a bulk execution with the given task ID.
 * @param {Object} options
 * @param {string} options.taskId a task ID that was returned by a previous call to executeBulk
 * @returns {RecordActionTaskStatus} a status object capturing the current state of the bulk action execution; see task module JSDoc
 */
action.prototype.getBulkStatus = function(options) {};

/**
 * Singleton object to be used as condition parameter in executeBulk.
 */
action.prototype.ALL_QUALIFIED_INSTANCES = function() {};

action = new action();
/**
 * @type {action}
 */
N.prototype.action = action;