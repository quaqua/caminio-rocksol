/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-22 14:17:27
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-24 10:31:51
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */
module.exports = function( caminio ) {

  return {
    run: function( options, next ){
      next();
    }
  }

}