/**
 * SuiteScript error module
 *
 * @module N/error
 * @NApiVersion 2.x
 *
 * IMPORTANT! Beware of introducing circular dependencies, almost every single module depends on the [error] and [invoker] modules.
 * Only simple dependencies such as Java api bridges (although client side bridges could be an issue) are safe here.
 * Also note that it is intentional that [error] module does not use invoker for that reason, which means that any intercepting
 * logic there will not be called.
 */
function error() {}
/**
 * Create a new Error object
 *
 * @param {Object} options
 * @param {string} options.name
 * @param {string} options.message
 * @param {string} options.notifyOff
 * @return {SuiteScriptError}
 */
error.prototype.create = function(options) {};

/**
 *
 * @protected
 * @constructor
 */
function SuiteScriptError() {
    
    /**
     * @name SuiteScriptError#type
     * @type string
     * @readonly
     * @since 2015.2
     */    
    this.prototype.type = undefined;    
    /**
     * @name SuiteScriptError#id
     * @type string
     * @readonly
     * @since 2015.2
     */    
    this.prototype.id = undefined;    
    /**
     * @name SuiteScriptError#name
     * @type string
     * @readonly
     * @since 2015.2
     */    
    this.prototype.name = undefined;    
    /**
     * @name SuiteScriptError#message
     * @type string
     * @readonly
     * @since 2015.2
     */    
    this.prototype.message = undefined;    
    /**
     * @name SuiteScriptError#stack
     * @type string[]
     * @readonly
     * @since 2015.2
     */    
    this.prototype.stack = undefined;    
    /**
     * @name SuiteScriptError#cause
     * @type Anything
     * @readonly
     * @since 2016.1
     */    
    this.prototype.cause = undefined;    
    /**
     * @name SuiteScriptError#notifyOff
     * @type boolean
     * @readonly
     * @since 2016.2
     */    
    this.prototype.notifyOff = undefined;}

/**
 *
 * @protected
 * @constructor
 */
function UserEventError() {
    
    /**
     * @name SuiteScriptError#recordId
     * @type string
     * @readonly
     * @since 2015.2
     */    
    this.prototype.recordId = undefined;    
    /**
     * @name SuiteScriptError#eventType
     * @type string
     * @readonly
     * @since 2015.2
     */    
    this.prototype.eventType = undefined;}

error = new error();
/**
 * @type {error}
 */
N.prototype.error = error;