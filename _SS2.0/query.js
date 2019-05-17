/**
 * SuiteScript new-generation query common module
 *
 * @module N/query
 * @suiteScriptVersion 2.x
 */
function query() {}
/**
 * The query definition.
 */
function Query() {
    
    /**
     * Query type. Returns the query type given upon the creation of the query object.
     * @name Query#type
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.type = undefined;    
    /**
     * Query condition.
     * @name Query#condition
     * @type Condition
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE when setting value of different type than Query.Condition
     */    
    this.prototype.condition = undefined;    
    /**
     * Columns to be returned from the query.
     * @name Query#columns
     * @type Column[]
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE when setting value of different type than Query.Column array
     */    
    this.prototype.columns = undefined;    
    /**
     * Specifies how the results will be sorted.
     * @name Query#sort
     * @type Sort[]
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE when setting value of different type than Query.Sort array
     */    
    this.prototype.sort = undefined;    
    /**
     * Children of the root component of the query. It is an object with key/value pairs where key is the name of the
     * child component and value is the corresponding Component object. This is a shortcut for the Query.root.child expression.
     * @name Query#child
     * @type Object
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.child = undefined;    
    /**
     * Id of this query, null if query is not saved
     * @name Query#id
     * @type Number
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.id = undefined;    
    /**
     * Name of this query, null if query is not saved
     * @name Query#name
     * @type String
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.name = undefined;    
    /**
     * Access the root component of the query. It is the component that corresponds to the query type given upon the
     * creation of the whole Query object.
     * @name Query#root
     * @type Component
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.root = undefined;    
    /**
     * Execute the query and return results.
     * @governance 10 points
     * @returns {ResultSet} the result set object
     */    
    this.prototype.run = function(options) {};    
    this.run.promise = function(options) {};    
    
    /**
     * Execute the query and return paged results.
     * @governance 10 points
     * @returns {PagedData} the paged query object
     */    
    this.prototype.runPaged = function(options) {};    
    this.runPaged.promise = function(options) {};    
    
    /**
     * join the root component of the Query with another query type. This is a shortcut for Query.root.autoJoin.
     * @see Component#autoJoin
     */    
    this.prototype.autoJoin = function() {};    
    
    /**
     * join the root component of the Query with another query type. This is a shortcut for Query.root.autoJoin.
     * @see Component#join
     */    
    this.prototype.join = function() {};    
    
    /**
     * join the root component of the Query with another (target) query type. This is a shortcut for Query.root.joinTo.
     * @see Component#joinTo
     */    
    this.prototype.joinTo = function() {};    
    
    /**
     * join the root component of the Query with another (source) query type. This is a shortcut for Query.root.joinFrom.
     * @see Component#joinFrom
     */    
    this.prototype.joinFrom = function() {};    
    
    /**
     * Create a Condition object based on the root component of the Query. This is a shortcut for Query.root.createCondition.
     * @see Component#createCondition
     */    
    this.prototype.createCondition = function() {};    
    
    /**
     * Create a Column object based on the root component of the Query. This is a shortcut for Query.root.createColumn.
     * @see Component#createColumn
     */    
    this.prototype.createColumn = function() {};    
    
    /**
     * Create a Sort object based on the root component of the Query. This is a shortcut for Query.root.createSort.
     * @see Component#createSort
     */    
    this.prototype.createSort = function() {};    
    
    /**
     * Create a new Condition object that corresponds to a logical conjunction (AND) of the Condition objects given to
     * the method as arguments. The arguments must be one or more Condition objects.
     * @param {Condition} condition1
     * @param {Condition} condition2
     * @param {Condition} condition<n>
     * @returns {Condition}
     */    
    this.prototype.and = function(options) {};    
    
    /**
     * Create a new Condition object that corresponds to a logical disjunction (OR) of the Condition objects given to
     * the method as arguments. The arguments must be one or more Condition objects.
     * @param {Condition} condition1
     * @param {Condition} condition2
     * @param {Condition} condition<n>
     * @returns {Condition}
     */    
    this.prototype.or = function(options) {};    
    
    /**
     * Create a new Condition object that corresponds to a logical negation (NOT) of the Condition object given to the method
     * as argument.
     * @param {Condition} condition
     * @returns {Condition}
     */    
    this.prototype.not = function(options) {};    
    
    /**
     * Converts a Query object to corresponding SuiteQL representation
     * @returns {SuiteQL}
     */    
    this.prototype.toSuiteQL = function() {};    
    
    /**
     * Returns the object type name.
     * @returns {string}
     */    
    this.prototype.toString = function() {};    
    
    /**
     * JSON.stringify() implementation.
     * @returns {Object}
     */    
    this.prototype.toJSON = function() {};    
}

/**
 * One component of the query definition. The Query object always contains at least one Component object called the root
 * component. Queryes with multi-level joins contain multiple Component objects linked together into a parent/child hierarchy.
 */
function Component() {
    
    /**
     * Query type. Returns the query type of this component.
     * @name Component#type
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.type = undefined;    
    /**
     * Inverse target. Returns the source query type from which is this component joined.
     * @name Component#source
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.source = undefined;    
    /**
     * Polymorphic target. Returns the target target of this component.
     * @name Component#target
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.target = undefined;    
    /**
     * Returns the Component that corresponds to the ancestor of this component in the query object model.
     * @name Component#parent
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.parent = undefined;    
    /**
     * Children of this component. It is an object with key/value pairs where key is the name of the child component
     * and value is the corresponding Component object.
     * @name Component#child
     * @type Object
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.child = undefined;    
    /**
     * join this component with another query type. A new component corresponding to the given relationship is created
     * and joined with this one.
     * @param {Object} options
     * @param {string} options.fieldId The relationship field that will be used to determine the query type of the
     *                                      newly joined component and also the columns on which the query types will be joined
     *                                      together. For example "salesrep".
     * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if fieldId is undefined
     * @throws {error.SuiteScriptError} RELATIONSHIP_ALREADY_USED if relationship is already used
     * @returns {Component}
     */    
    this.prototype.autoJoin = function(options) {};    
    
    /**
     * join this component with another query type. A new component corresponding to the given relationship is created
     * and joined with this one.
     * @param {Object} options
     * @param {string} options.name The name of the relationship that will be used to determine the query type of the
     *                                      newly joined component and also the columns on which the query types will be joined
     *                                      together. For example "salesrep".
     * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if name is undefined
     * @throws {error.SuiteScriptError} RELATIONSHIP_ALREADY_USED if relationship is already used
     * @returns {Component}
     */    
    this.prototype.join = function(options) {};    
    
    /**
     * join this component with another query type. A new component corresponding to the given relationship is created
     * and joined with this one.
     * @param {Object} options
     * @param {string} options.name The name of the relationship field on which join with other query type is performed
     *                                      For example "entity".
     * @param {string} options.target The target target of the join. It is the specialized query type with which is
     *                                      this component joined.
     *                                      For example query.Type.CUSTOMER
     * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if relationship is undefined
     * @throws {error.SuiteScriptError} RELATIONSHIP_ALREADY_USED if relationship is already used
     * @returns {Component}
     */    
    this.prototype.joinTo = function(options) {};    
    
    /**
     * join this component with another query type. A new component corresponding to the given relationship is created
     * and joined with this one.
     * @param {Object} options
     * @param {string} options.name The name of the relationship field on which join with other query type is performed
     *                                      For example "salesrep".
     * @param {string} options.source The query type on which is relationship field used to create the join with this component
     *                                      For example query.Type.CUSTOMER
     * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if relationship is undefined
     * @throws {error.SuiteScriptError} RELATIONSHIP_ALREADY_USED if relationship is already used
     * @returns {Component}
     */    
    this.prototype.joinFrom = function(options) {};    
    
    /**
     * Create a Condition object based on this query component. Use either fieldId + operator + values or formula + (optional)
     * type.
     * @param {Object} options
     * @param {string} options.fieldId Field (column) id
     * @param {string} options.operator Operator. Use the Operator enum.
     * @param {string[]} options.values Array of values
     * @param {string} options.formula Formula
     * @param {string} options.type (optional) Explicitly define value type in case it is not determined correctly from the
     *                                         formula. Use the ReturnType enum.
     * @param {string} options.aggregate (optional) Aggregate function. Use the Aggregate enum.
     * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if options are undefined
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if options isn't object
     * @throws {error.SuiteScriptError} OPERATOR_ARITY_MISMATCH if requested operator cannot work with specified number of
     *     arguments
     * @throws {error.SuiteScriptError} INVALID_SEARCH_OPERATOR if wrong query operator is used
     * @returns {Condition}
     */    
    this.prototype.createCondition = function(options) {};    
    
    /**
     * Create a Column object based on this query component. Use either name or formula + (optional) type.
     * @param {Object} options
     * @param {string} options.fieldId Field (column) id
     * @param {string} options.formula Formula
     * @param {string} options.type (optional) Explicitly define value type in case it is not determined correctly from the
     *                                         formula. Use the ReturnType enum.
     * @param {string} options.aggregate (optional) Aggregate function. Use the Aggregate enum.
     * @param {boolean} options.groupBy (optional) Indicates that we want the results grouped by this column; used together
     *                                             with aggregate function defined on other columns.
     * @param {Object} options.context (optional) Field context
     * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if options are undefined
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if options isn't object
     * @throws {error.SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS when two mutually arguments are defined
     * @throws {error.SuiteScriptError} NEITHER_ARGUMENT_DEFINED when neither of two mandatory arguments is defined
     * @returns {Column}
     */    
    this.prototype.createColumn = function(options) {};    
    
    /**
     * Create a Sort object based on this query component.
     * @param {Object} options
     * @param {string} options.column The Column by which we want to sort.
     * @param {boolean} options.ascending (optional) The sort direction. True by default.
     * @param {boolean} options.nullsLast (optional) Where to put results with null value. Defaults to value of ascending flag
     * @param {boolean} options.caseSensitive (optional)
     * @param {string} options.locale
     * @returns {Sort}
     */    
    this.prototype.createSort = function(options) {};    
}

/**
 * Specifies a return column.
 */
function Column() {
    
    /**
     * Id of column field.
     * @name Column#fieldId
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.fieldId = undefined;    
    /**
     * Query component. Returns the Component to which this column belongs.
     * @name Column#component
     * @type Component
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.component = undefined;    
    /**
     * Formula.
     * @name Column#formula
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.formula = undefined;    
    /**
     * Desired value type of the formula (if it was explicitly stated upon Column creation).
     * @name Column#type
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.type = undefined;    
    /**
     * Aggregate function.
     * @name Column#aggregate
     * @type string (value from Aggregate enum)
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.aggregate = undefined;    
    /**
     * The group-by flag.
     * @name Column#groupBy
     * @type boolean
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.groupBy = undefined;    
    /**
     * Field context
     * @name Column#context
     * @type Object
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.context = undefined;}

/**
 * Specifies sorting by the values of a given column and the sort direction.
 */
function Sort() {
    
    /**
     * The query column by which we want to sort.
     * @name Sort#column
     * @type Column
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.column = undefined;    
    /**
     * Flag indicating if sort is ascending
     * @name Sort#ascending
     * @type Boolean
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE when setting wrong sort order is attempted
     */    
    this.prototype.ascending = undefined;    
    /**
     * Sort case sensitivity.
     * @name Sort#caseSensitive
     * @type Boolean
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
     */    
    this.prototype.caseSensitive = undefined;    
    /**
     * Flag indicating where results with null value should be sorted
     * @name Sort#nullsLast
     * @type Boolean
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
     */    
    this.prototype.nullsLast = undefined;    
    /**
     * Sort locale
     * @name Sort#locale
     * @type String
     * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
     */    
    this.prototype.locale = undefined;}

/**
 * Specifies the condition used to filter the results. It can consist of other Condition objects.
 */
function Condition() {
    
    /**
     * This is only applicable to "non-leaf" conditions that were created by AND-ing, OR-ing or NOT-ing other Condition objects.
     * In such case this property holds the child Component objects that are arguments of the logical operation.
     * @name Condition#children
     * @type Condition[]
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.children = undefined;    
    /**
     * Field id. This is only applicable to "leaf" conditions (equivalent to the former Filter).
     * @name Condition#fieldId
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.fieldId = undefined;    
    /**
     * Operator. This is only applicable to "leaf" conditions (equivalent to the former Filter).
     * @name Condition#operator
     * @type string (values from the Operator enum)
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.operator = undefined;    
    /**
     * Values. This is only applicable to "leaf" conditions (equivalent to the former Filter).
     * @name Condition#values
     * @type string[]
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.values = undefined;    
    /**
     * Formula. This is only applicable to "leaf" conditions (equivalent to the former Filter).
     * @name Condition#formula
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.formula = undefined;    
    /**
     * Return type of the formula, if explicitly specified. This is only applicable to "leaf" conditions (equivalent to the
     * former Filter).
     * @name Condition#type
     * @type string (values from the ReturnType enum)
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.type = undefined;    
    /**
     * Aggregate function. This is only applicable to "leaf" conditions (equivalent to the former Filter).
     * @name Condition#aggregate
     * @type string (values from the Aggregate enum)
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.aggregate = undefined;    
    /**
     * Query component to which this condition belongs. This is only applicable to "leaf" conditions (equivalent to the
     * former Filter).
     * @name Condition#component
     * @type string
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.component = undefined;}

/**
 * Set of results returned by the query.
 */
function ResultSet() {
    
    /**
     * Standard object for iterating through results.
     * @governance 10 points for each page returned
     * @returns {Iterator}
     */    
    this.prototype.iterator = function() {};    
    
    /**
     * The actual query results.
     * @name ResultSet#results
     * @type Result[]
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.results = undefined;    
    /**
     * The types of the return values. Array of values from the ReturnType enum. Number and order of values in the array
     * exactly matches the ResultSet#columns property.
     * @name ResultSet#types
     * @type string[]
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.types = undefined;    
    /**
     * The return columns.
     * @name ResultSet#columns
     * @type Column[]
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.columns = undefined;}

/**
 * Corresponds to a single row of the ResultSet.
 */
function Result() {
    
    /**
     * The result values. Value types correspond to the ResultSet#types property. Number and order of values in the array
     * exactly matches the ResultSet#types, ResultSet#columns or Result#columns property.
     * @name Result#values
     * @type string|number[]
     * @readonly
     * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
     */    
    this.prototype.values = undefined;}

/**
 * Create a Query object with a single query component based on the given query type.
 * @param {Object} options
 * @param {string} options.type The query type. Use the Type enum.
 * @param {Object[]} options.columns (optional) Array of objects to be used as query columns (createColumn method will be called on all of them)
 * @param {Object[]} options.sort (optional) Array of objects representing sort options (createColumn and createSort methods will be called on all of them)
 * @param {Object} options.condition (optional) Condition of query (createCondition method will be called on supplied object)
 * @throws {error.SuiteScriptError} INVALID_RCRD_TYPE when query type is invalid
 * @returns {Query}
 */
function createQuery() {
}

/**
 * Loads query by id
 * @param {Object} options
 * @param {String} options.id Id of query to be loaded
 * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if options or id are undefined
 * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if options isn't object or id isn't string
 * @throws {error.SuiteScriptError} UNABLE_TO_LOAD_QUERY if query doesn't exist or no permissions to load it
 * @returns {Query}
 */
function loadQuery() {
}

/**
 * Deletes query by id
 * @param {Object} options
 * @param {String} options.id Id of query to be delete
 * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if options or id are undefined
 * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if options isn't object or id isn't string
 * @throws {error.SuiteScriptError} UNABLE_TO_DELETE_QUERY if query doesn't exist or no permissions to delete it
 * @returns {Query}
 */
function deleteQuery() {
}

/**
 * Runs suiteQL query, parameter can be string, suiteQL object or object containing properties query and (optionally) params
 * @param {Object} options
 * @param {String} options.query String representation of SuiteQL query
 * @param {(string|number|boolean)[]} options.params (optional)
 * @throws {error.SuiteScriptError} MISSING_REQD_ARGUMENT if options or query are undefined
 * @throws {error.SuiteScriptError} SSS_INVALID_TYPE_ARG if there's parameter of different type than string/number/boolean in params array
 * @returns {ResultSet}
 */
function runSuiteQL() {
}

/**
 * Creates RelativeDate object, which can be used as a filter value
 * @param {Object} options
 * @param {String} options.dateId Id of relative date range (e. g. query.DateId.DAYS_AGO)
 * @param {String} options.value Value of the date range (e. g. 5 -> five days ago)
 * @throws {error.SuiteScriptError} INVALID_DATE_ID if dateId isn't one of DateId enum's value
 * @throws (error.SuiteScriptError} WRONG_PARAMETER_TYPE if value is not a number
 * @returns {RelativeDate}
 */
function createRelativeDate() {
}

query = new query();
/**
 * @type {query}
 */
N.prototype.query = query;