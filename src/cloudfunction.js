/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var _ = require('underscore');

module.exports = function(AV) {
  /**
   * @namespace Contains functions for calling and declaring
   * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.
   * <p><strong><em>
   *   Some functions are only available from Cloud Code.
   * </em></strong></p>
   */
  AV.Cloud = AV.Cloud || {};

  _.extend(AV.Cloud, /** @lends AV.Cloud */ {
    /**
     * Makes a call to a cloud function.
     * @param {String} name The function name.
     * @param {Object} data The parameters to send to the cloud function.
     * @param {Object} options A Backbone-style options object
     * options.success, if set, should be a function to handle a successful
     * call to a cloud function.  options.error should be a function that
     * handles an error running the cloud function.  Both functions are
     * optional.  Both functions take a single argument.
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     */
    run: function(name, data, options) {
      var request = AV._request("functions", name, null, 'POST',
                                   AV._encode(data, null, true));

      return request.then(function(resp) {
        return AV._decode(null, resp).result;
      })._thenRunCallbacks(options);
    },

    /**
     * Makes a call to a cloud function, you can send {AV.Object} as param or a field of param; the response
     * from server will also be parsed as an {AV.Object}, array of {AV.Object}, or object includes {AV.Object}
     * @param {String} name The function name.
     * @param {Object} data The parameters to send to the cloud function.
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} A promise that will be resolved with the result of the function.
     */
    rpc: function(name, data, options) {
      if (_.isArray(data)) {
        return AV.Promise.error(new Error('Can\'t pass Array as the param of rpc function in JavaScript SDK.'))
          ._thenRunCallbacks(options);
      }

      return AV._request('call', name, null, 'POST', AV._encodeObjectOrArray(data)).then(function(resp) {
        return AV._decode('', resp).result;
      })._thenRunCallbacks(options);
    },

    /**
     * Make a call to request server date time.
     * @param {Object} options A Backbone-style options object
     * options.success, if set, should be a function to handle a successful
     * call to a cloud function.  options.error should be a function that
     * handles an error running the cloud function.  Both functions are
     * optional.  Both functions take a single argument.
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     * @since 0.5.9
     */
    getServerDate: function(options) {
      var request = AV._request("date", null, null, 'GET');

      return request.then(function(resp) {
        return AV._decode(null, resp);
      })._thenRunCallbacks(options);
    },

    /**
     * Makes a call to request a sms code for operation verification.
     * @param {Object} data The mobile phone number string or a JSON
     *    object that contains mobilePhoneNumber,template,op,ttl,name etc.
     * @param {Object} options A Backbone-style options object
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     */
    requestSmsCode: function(data, options){
      if(_.isString(data)) {
        data = { mobilePhoneNumber: data };
      }
      if(!data.mobilePhoneNumber) {
        throw "Missing mobilePhoneNumber.";
      }
      var request = AV._request("requestSmsCode", null, null, 'POST',
                                    data);
      return request._thenRunCallbacks(options);
    },

    /**
     * Makes a call to verify sms code that sent by AV.Cloud.requestSmsCode
     * @param {String} code The sms code sent by AV.Cloud.requestSmsCode
     * @param {phone} phone The mobile phoner number(optional).
     * @param {Object} options A Backbone-style options object
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     */
    verifySmsCode: function(code, phone, options){
      if(!code)
        throw "Missing sms code.";
      var params = {};
      if(AV._.isString(phone)) {
         params['mobilePhoneNumber'] = phone;
      } else {
        // To be compatible with old versions.
         options = phone;
      }

      var request = AV._request("verifySmsCode", code, null, 'POST',
                                   params);
      return request._thenRunCallbacks(options);
    }
  });
};
