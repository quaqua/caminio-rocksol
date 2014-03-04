/**
 *
 * @class Pebble
 *
 */
 
module.exports = function Pebble( caminio, mongoose ){

  var Translation = require('./_sub/translation')( caminio, mongoose );

  var ObjectId = mongoose.Schema.Types.ObjectId;

  var schema = new mongoose.Schema({

    /**
     * @property name
     * @type String
     */  
    name: { type: String, public: true },

    /**
     * @property translations
     * @type Array an array of Translation Schema Objects
     */
    translations: [ Translation ],
    
    /**
     *  @attribute camDomain
     *  @type ObjectId
     */
    camDomain: { type: ObjectId, ref: 'Domain' },

    /**
     * @property createdAt
     * @type Date
     */

    /**
     * @property createdBy
     * @type ObjectId
     */
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: ObjectId, ref: 'User' },

    /**
     * @property updatedAt
     * @type Date
     */

    /**
     * @property updatedBy
     * @type ObjectId
     */
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: ObjectId, ref: 'User' }

  });

  return schema;

};