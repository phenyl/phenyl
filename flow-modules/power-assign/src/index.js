// @flow
import PowerAssign from './power-assign.js'
export {
  assign,
  assignToProp,
  assignWithRestoration,
  assignToPropWithRestoration,
} from './power-assign.js'
export {
  retargetToProp,
  retargetToPropWithRestoration,
} from './retarget-to-prop.js'

/**
 * Rename and export functions from oad-utils.
 * This is because "power-assign" should be more widely used outside phenyl monorepo system.
 */
export {
  mergeUpdateOperations as mergeOperations,
  updateOperationToJSON as toJSON,
  normalizeUpdateOperation as normalizeOperation,
} from 'oad-utils/jsnext'

export default PowerAssign
