/*****************************************************************************
 * Name:        Transaction Line Calculator TransactionLineCalculator.js
 *
 * Script Type: Client - form level
 *
 * API Version: 2.0
 *
 * Version:     1.0.0 - 01/12/2015 - Initial Creation CW
 *              1.0.1 - 10/12/2015 - Emulated strange item subtotal calculation - CW
 *              1.0.2 - 16/12/2015 - Removed shipmethod clearing on line submit - CW  
 *              1.0.3 - 21/12/2015 - Clear ship method on create for S10018 - CW
 *              1.1.0 - 22/12/2015 - Re-enabled clearing of shipmethod - CW
 *              1.1.1 - 02/02/2016 - Added support for trade customers - CW
 *              1.1.2 - 03/02/2016 - Case S10263 - Shipping methods are no longer cleared on transform (trigger: copy). - PB
 *              1.1.3 - 03/02/2016 - Fixed missing TRADE_CUSTOMER declaration - SB
 *              1.1.4 - 05/02/2016 - fixed line edit bug - CW
 *              1.1.5 - 11/04/2016 - S10579 Fixed bug where bodyData not passed to function - SB
 *              1.1.6 - 12/12/2016 - S11573 - Incorporates UOM when determining the GPM. - PB
 *              2.0.0 - 27/03/2017 - PS858 & port to Suitescript 2 - CW
 *                      - 22/05/2017 - added context checks and moved into script record - CW
 *              2.0.1 - 07/06/2017 - PS858 ensured coverage adjust calculates total properly - CW
 *              2.0.2 - 12/06/2017 - PS858 fixed incorrect % calulations
 *              2.0.3 - 17/06/2020 - SuiteCentric AFB - clearShippingFields now doesn't remove ship method nor throw error
 *              2.0.4 - 13/08/2020 - SuiteCentric CE - commented out bandaid fix and commented out clearShippingFields code
 *              2.0.5 - 15/03/2021 - BrightBridge - added additional code to set Length in M field for carpet items
 *
 * Author:      FHL
 *
 * Script:      No script or deployment records as this is a form level client script
 * 
 * Deployments:	
 *
 * Purpose:     Automatically calculate some column fields for the user
 *
 * Notes:       Old versions were called mSquaredPrice.js and mSquaredPricePhase4.js
 *
 * Dependencies: No libraries needed!
 *******************************************************************************/
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N'],
    /**
     * @param {N} N
     */
    function (N) 
    {
        'use strict';
        /**
         * @class line class
         * @param {Object} scriptContext
         * @returns {Object} current line object
         */
        function Line(scriptContext) 
        {
            /*####################### Constants #######################*/
            this.COLUMNS_TO_LOAD = [
                'quantity',
                'custcol_adjustmetresquared',
                'amount',
                'custcol_adjustsubtotal',
                'rate',
                'rateschedule',
                'custcol_gpr',
                'custcol_adjustgrossprofit',
                'custcol_cost',
                'custcol_lastpurchaseprice',
                'custcol_issampleitem',
                'custcol_product_category',
                'custcol_coverage',
                'custcol_bbs_length',
                'custcol_pricemtwo',
                'custcol_matrixparent',
                'custcol_sqmperpack',
                'custcol_adjustrate'
            ];
            /*####################### Getters #######################*/
            /**
             * Determine the item type
             * @private
             * @returns {String}
             */
            this.getItemType = function () 
            {
                try
                {
                    if (this.custcol_matrixparent) 
                    {
                        if (this.custcol_sqmperpack) 
                        {
                            this.type = 'roll';
                        }
                        else 
                        {
                            this.type = 'rug';
                        }
                    }
                    else if (this.custcol_sqmperpack) 
                    {
                        this.type = 'board';
                    }
                    else 
                    {
                        this.type = 'unit';
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
                return this.type;
            };
            /**
             * Determine the item purchase price
             * @private
             * @returns {Number}
             */
            this.getPurchasePrice = function () 
            {
                try 
                {
                    this.purchasePrice = 0;
                    if (this.custcol_lastpurchaseprice) 
                    {
                        this.purchasePrice = this.custcol_lastpurchaseprice;
                    }
                    else if (this.custcol_cost) 
                    {
                        this.purchasePrice = this.custcol_cost;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
                return this.purchasePrice;
            };
            /**
             * Calculate the coverage of a given pack amount 
             * @private
             * @returns {number or string} current line object
             */
            this.getCoverage = function () 
            {
                try 
                {
                    if (!this.quantity || !this.custcol_sqmperpack) 
                    {
                        this.custcol_coverage = 0;
                    }
                    else 
                    {
                        this.custcol_coverage = this.quantity * this.custcol_sqmperpack;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
                return this.custcol_coverage;
            };
            /**
             * Determine the item gross profit
             * 2.0.2 fixed incorrect % calculation
             * @private
             * @returns {Number}
             */
            this.getGrossProfit = function () 
            {
                try 
                {
                    this.custcol_gpr = 0;
                    if (this.getPurchasePrice()) 
                    {
                        this.custcol_gpr = (((this.rate - this.purchasePrice) / this.rate) * 100).toFixed(2);
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
                return this.custcol_gpr;
            };
            /**
             * Determine the item unit cost
             * @private
             * @returns {Number}
             */
            this.getAreaUnitPrice = function () 
            {
                try 
                {
                    this.custcol_pricemtwo = 0;
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'board':
                            if (this.custcol_sqmperpack) 
                            {
                                this.custcol_pricemtwo = (this.rate / this.custcol_sqmperpack).toFixed(2);
                            }
                            break;
                        case 'rug':
                        case 'unit':
                            this.custcol_pricemtwo = this.rate;
                            break;
                        case 'sample':
                            this.custcol_pricemtwo = 0;
                            break;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
                return this.custcol_pricemtwo;
            };
            /**
             * Determine the current rate when it does not change automatically
             * @since 2.0.1
             * @private
             * @returns {Number}
             */
            this.getShedRate = function()
            {
                try 
                {
                    if(this.rateschedule)
                    {
                        //parse the shedule into a useable amount
                        var shedStrings = this.rateschedule.split(String.fromCharCode(5));//NS uses ENQ character for some reason
                        var shedSorted  = [];
                        shedStrings.forEach(function (value, index, array) 
                        {
                            if (!!(index % 2)) 
                            {
                                shedSorted.push([parseFloat(array[index - 1]) ,  parseFloat(value)]);
                            }
                        });
                        //look for the applicable shedule
                        for(var i = 0; i < shedSorted.length; i++)
                        {
                            if(this.quantity > shedSorted[i][0])
                            {
                                this.rate = shedSorted[i][1];
                            }
                        }
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
                return this.rate;
            };

            /*####################### Setters #######################*/
            /** handle a change in quantity 
             * @public 
             * @returns {Void}
             */
            this.setQuantity = function () 
            {               
            	try 
                {
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'rug':
                        	this.custcol_bbs_length = (this.quantity / 100);
                        	break;
                        case 'board':
                        case 'unit':
                            this.quantity = parseInt(this.quantity);
                            this.getCoverage();
                            this.rate = this.getShedRate();
                            this.custcol_adjustrate = this.rate;
                            this.custcol_adjustmetresquared = this.getAreaUnitPrice();
                            this.custcol_adjustgrossprofit = this.getGrossProfit();
                            this.amount = (this.quantity * this.custcol_adjustrate).toFixed(2);
                            break;
                        case 'sample':
                            this.reset();
                            this.quantity = 1;
                            break;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            /** handle a change in length
             * @public 
             * @returns {Void}
             */
            this.setLength = function () 
            {
            	try 
                {
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'rug':
                        	this.quantity = (this.custcol_bbs_length * 100);
                        	this.amount = (this.quantity * this.rate).toFixed(2);
                        	break;
                        case 'board':
                        case 'unit':
                        case 'sample':
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            /** handle a change in coverage 
             * @public 
             * @returns {Void}
             */
            this.setCoverage = function () 
            {
                try 
                {
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'board':
                            this.custcol_adjustrate = 0;
                            this.quantity = Math.ceil(this.custcol_coverage / this.custcol_sqmperpack);
                            this.setQuantity();
                            break;
                        case 'sample':
                            this.reset();
                            this.quantity = 1;
                            break;
                        case 'rug':
                        case 'unit':
                            this.custcol_coverage = 0;
                            break;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            /** handle a change in gross profit 
             * @public 
             * @returns {Void}
             */
            this.setGrossProfit = function () 
            {
                try 
                {
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'board':
                        case 'rug':
                        case 'unit':
                            if (this.getPurchasePrice()) 
                            {
                                this.custcol_adjustrate = (this.purchasePrice / ( 1 - parseFloat(this.custcol_adjustgrossprofit)/100 )).toFixed(2);
                            }
                            this.setRate();
                            break;
                        case 'sample':
                            this.reset();
                            this.quantity = 1;
                            break;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            /** handle a change in unitprice 
             * @public 
             * @returns {Void}
             */
            this.setUnitPrice = function () 
            {
                try 
                {
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'board':
                            this.custcol_adjustrate = this.custcol_sqmperpack * this.custcol_adjustmetresquared;
                            this.setRate();
                            break;
                        case 'rug':
                        case 'unit':
                            this.custcol_adjustrate = this.custcol_adjustmetresquared;
                            this.setRate();
                            break;
                        case 'sample':
                            this.reset();
                            this.quantity = 1;
                            break;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            /** handle a change in amount 
            * @public 
            * @returns {Void}
            */
            this.setAmount = function () 
            {
                try 
                {
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'board':
                        case 'rug':
                        case 'unit':
                            if (this.setRate) 
                            {
                                this.custcol_adjustrate = (this.setRate / this.quantity).toFixed(2);
                                this.setRate();
                            }
                            else 
                            {
                                this.reset();
                            }
                            break;
                        case 'sample':
                            this.reset();
                            break;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            /** handle a change in rate 
             * @public 
             * @returns {Void}
             */
            this.setRate = function () 
            {
                try 
                {
                    switch (this.type) 
                    {
                        case 'roll':
                        case 'board':
                            this.amount = this.quantity * this.custcol_adjustrate;
                            this.custcol_adjustmetresquared = (this.custcol_adjustrate / this.custcol_sqmperpack).toFixed(2);
                            if (this.getPurchasePrice()) 
                            {
                                this.custcol_adjustgrossprofit = (((this.custcol_adjustrate - this.purchasePrice) / this.custcol_adjustrate) * 100).toFixed(2);
                            }
                            break;
                        case 'rug':
                        case 'unit':
                            this.amount = this.quantity * this.custcol_adjustrate;
                            this.custcol_adjustmetresquared = this.custcol_adjustrate;
                            if (this.getPurchasePrice()) 
                            {
                                this.custcol_adjustgrossprofit = (((this.custcol_adjustrate - this.purchasePrice) / this.custcol_adjustrate) * 100).toFixed(2);
                            }
                            break;
                        case 'sample':
                            this.reset();
                            break;
                        default:
                            break;
                    }
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            /** zero all properties 
             * @public 
             * @returns {Void}
             */
            this.reset = function () 
            {
                try 
                {
                    this.COLUMNS_TO_LOAD.forEach(function (field) 
                    {
                        self[field] = null;
                    });
                }
                catch (e) 
                {
                    errorHandler(e);
                }

            };
            /** initilise the line object and properties 
             * @public 
             * @param {Object} scriptContext
             * @returns {Void}
             */
            this.initialize = function (scriptContext) 
            {
                try 
                {
                    /**
                    * inline function to create prperties 
                    * @param {String} name of a column field
                    * @returns {Void} 
                    */
                    this.COLUMNS_TO_LOAD.forEach(function (field) 
                    {
                        self[field] = scriptContext.currentRecord.getCurrentSublistValue({
                            sublistId: scriptContext.sublistId,
                            fieldId: field,
                            line: (scriptContext.lineNum + 1)
                        });
                    });
                    self.getItemType();
                }
                catch (e) 
                {
                    errorHandler(e);
                }
            };
            var self = this;
            this.initialize(scriptContext);
        }
        /*####################### public functions #######################*/
        /**
         * Function to be executed after page is initialized.
         * @public
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {String} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         * @returns {Void}
         */
        function pageInit(scriptContext) 
        {
            if (N.runtime.executionContext == N.runtime.ContextType.USER_INTERFACE) 
            {
                try 
                {
                    pageInitProcess(scriptContext);
                }
                catch (e) 
                {
                    errorHandler(e);
                    alert('Something went wrong. Please contact support');
                }
            }
        }
        /**
         * Function to be executed when field is changed.
         * @public
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {String} scriptContext.sublistId - Sublist name
         * @param {String} scriptContext.fieldId - Field name
         * @param {Number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {Number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         * @returns {Void} 
         */
        function fieldChanged(scriptContext) 
        {
            if (N.runtime.executionContext == N.runtime.ContextType.USER_INTERFACE) 
            {
                try 
                {
                    fieldChangedProcess(scriptContext);
                }
                catch (e) 
                {
                    errorHandler(e);
                    alert('Something went wrong. Please contact support');
                }
            }
        }
        /**
         * @public
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {String} scriptContext.sublistId - Sublist name
         * @returns {Boolean} this allows the user to proceed with submitting the line
         */
        function validateLine(scriptContext) 
        {
            if (N.runtime.executionContext == N.runtime.ContextType.USER_INTERFACE) 
            {
                try 
                {
                    clearShippingFields(scriptContext);
                }
                catch (e) 
                {
                    errorHandler(e);
                    alert('Something went wrong. Please contact support');
                }
            }
            return true;
        }
        /*####################### private functions #######################*/
        /**
         * handle a page initilise event
         * @private
         * @param {Object} scriptContext
         * @returns {Void} 
         */
        function pageInitProcess(scriptContext) 
        {
            try 
            {
                setFullName(scriptContext);
                if (scriptContext.mode != 'edit') 
                {
                    scriptContext.currentRecord.setValue({
                        fieldId: 'custbody_celigo_export_to_magento',
                        value: true,
                        ignoreFieldChange: true,
                        fireSlavingSync: false
                    });
                }
                if (scriptContext.mode == 'create') 
                {
                    clearShippingFields(scriptContext, true);
                }
            }
            catch (e) 
            {
                errorHandler(e);
            }
        }
        /**
         * handle a field changed event
         * @private
         * @param {Object} scriptContext
         * @returns {Void} 
         */
        function fieldChangedProcess(scriptContext) 
        {
            // AFB 16/6/2020 Band aid fix to address existing script issue
            
            // CE 13/8/2020 Commented this code out because it was restoring the
            // incorrect shipmethod; since we have already commented out the
            // entire clearShippingFields code, this bandaid fix should no
            // longer be needed (and appears to have an undesired side-effect)
            
            // var silentMode = window.localStorage.getItem('promotionpostsourcing') === '1' ? true : false;
            // if (scriptContext.fieldId === 'applicabilitystatus')
            // {
            //     var shipMethod = scriptContext.currentRecord.getValue('shipmethod');
            //     window.localStorage.setItem('shipmethodid', shipMethod);
            //     window.localStorage.setItem('promotionpostsourcing', '1');
            // }
            // else if (scriptContext.fieldId === 'shippingcost')
            // {
            //     var shipMethod = window.localStorage.getItem('shipmethodid');
            //     if (shipMethod)
            //     {
            //         scriptContext.currentRecord.setValue(
            //         {
            //             fieldId: 'shipmethod', 
            //             value: shipMethod,
            //             ignoreFieldChange: true,
            //             forceSyncSourcing: true
            //         });
            //         window.localStorage.removeItem('shipmethodid');
            //         window.localStorage.removeItem('promotionpostsourcing');
            //     }
            // }
            
            try 
            {
                if (!getProcessingFlag(scriptContext)) 
                {
                    setProcessingFlag(scriptContext, true);
                    if (scriptContext.sublistId == 'item') 
                    {
                        lineChangedProcess(scriptContext);
                        setProcessingFlag(scriptContext, false);
                    }
                    else 
                    {
                        switch (scriptContext.fieldId) 
                        {
                            case 'entity':
                                setFullName(scriptContext);
                                break;
                            case 'shipaddresslist':
                                clearShippingFields(scriptContext);
                                break;
                        }
                        setProcessingFlag(scriptContext, false);
                    }
                    
                }
            }
            catch (e) 
            {
                errorHandler(e);
            }
        }
        /**
         * handle a line changed event
         * @private
         * @param {Object} scriptContext
         * @returns {Void} 
         */
        function lineChangedProcess(scriptContext) 
        {
            var lineData = null;
            try 
            {
                if (scriptContext.sublistId == 'item') 
                {
                    lineData = new Line(scriptContext);
                    switch (scriptContext.fieldId) 
                    {
                    	case 'custcol_bbs_length':
                    		lineData.setLength();
                    		break;
                    	case 'custcol_coverage':
                            lineData.setCoverage();
                            break;
                        case 'quantity':
                            lineData.setQuantity();
                            break;
                        case 'custcol_adjustgrossprofit':
                            lineData.setGrossProfit();
                            break;
                        case 'custcol_adjustmetresquared':
                            lineData.setUnitPrice();
                            break;
                        case 'custcol_adjustrate':
                            lineData.setRate();
                            break;
                        case 'item':
                            lineData.reset();
                            break;
                        case 'amount':
                            lineData.setAmount();
                            break;
                    }
//                    console.log(lineData);
                    writeLineData(scriptContext, lineData);
                }
            }
            catch (e) 
            {
                errorHandler(e);
            }
        }
        /**
         * write your calculated values to the line  
         * @private
         * @param {Object} scriptContext
         * @param {Object} lineData
         * @returns {Void} 
         */
        function writeLineData(scriptContext, lineData) 
        {
            try 
            {
                var COLUMNS_TO_WRITE = [
                    'quantity',
                    'custcol_adjustmetresquared',
                    'rate',
                    'custcol_gpr',
                    'custcol_adjustsubtotal',
                    'custcol_adjustgrossprofit',
                    'custcol_product_category',
                    'custcol_coverage',
                    'custcol_bbs_length',
                    'custcol_pricemtwo',
                    'custcol_adjustrate',
                    'amount'
                ];
                COLUMNS_TO_WRITE.forEach(function (field) 
                {
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: field,
                        value: (lineData[field] || 0),
                        ignoreFieldChange: false
                    });
                });
            }
            catch (e) 
            {
                errorHandler(e);
            }
        }
        /**
         * read the processing flag to prevent recursive calls
         * @private
         * @param {Object} scriptContext
         * @returns {Boolean} 
         */
        function getProcessingFlag(scriptContext) 
        {
            var permitProcessing = false;
            try 
            {
                permitProcessing = scriptContext.currentRecord.getValue({ fieldId: 'custbody_clientprocessing' });
            }
            catch (e) 
            {
                errorHandler(e);
            }
            return permitProcessing;
        }
        /**
         * switch the processing flag on or off
         * @private
         * @param {Object} scriptContext
         * @param {Boolean} flag
         * @returns {Void} 
         */
        function setProcessingFlag(scriptContext, flag) 
        {
            try 
            {
                scriptContext.currentRecord.setValue({
                    fieldId: 'custbody_clientprocessing',
                    value: flag,
                    ignoreFieldChange: true,
                    fireSlavingSync: false
                });
            }
            catch (e) 
            {
                errorHandler(e);
            }
        }
        /**
         * populate prefered name
         * @private
         * @param {Object} scriptContext
         * @returns {Void} 
         */
        function setFullName(scriptContext) 
        {
            var name = '';
            try 
            {
                name = scriptContext.currentRecord.getText({ fieldId: 'entity' });
                name = name.replace(/[0-9]/g, ''); //remove internal id
                name = name.replace(/(^\s+|\s+$)/g, ''); //remove white space
                scriptContext.currentRecord.setValue({
                    fieldId: 'custbody_preferredname',
                    value: name,
                    ignoreFieldChange: true,
                    fireSlavingSync: false
                });
            }
            catch (e) 
            {
                errorHandler(e);
            }
        }
        /**
         * Clear the shipping
         * @param {Object} scriptContext
         * @param {Boolean} silent - not mandatory 
         * @returns {Void} 
         */
        function clearShippingFields(scriptContext, silent) 
        {
            // var shipingMethod = '';
            // var shipingCost = 0;
            // try 
            // {
            //     shipingMethod = scriptContext.currentRecord.getValue({ fieldId: 'shipmethod' });
            //     shipingCost = scriptContext.currentRecord.getValue({ fieldId: 'shippingcost' });
            //     if (shipingMethod || !!shipingCost) 
            //     {
            //         scriptContext.currentRecord.setValue({
            //             fieldId: 'shipmethod',
            //             value: '',
            //             ignoreFieldChange: true,
            //             fireSlavingSync: false
            //         });
            //         scriptContext.currentRecord.setValue({
            //             fieldId: 'shippingcost',
            //             value: '',
            //             ignoreFieldChange: false,
            //             fireSlavingSync: false
            //         });
            //         if (!silent) 
            //         {
            //             //alert('Altering your items will potentially require a different shipping method. Shipping method has been cleared');
            //             // always do silent mode for now AFB 16/6/2020
            //         }
            //     }
            // }
            // catch (e) 
            // {
            //     errorHandler(e);
            // }
        }
        /**
         * handle an error event
         * @param {Object} JS error object
         * @returns {Void} 
         */
        function errorHandler(e) 
        {
            console.error(e);
        }
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            validateLine: validateLine
        };
    }
);
