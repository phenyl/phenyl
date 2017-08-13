// @flow
import type {
  UpdateCommand
} from 'phenyl-interfaces'

import { assign } from 'power-assign/jsnext'

type PlainPhenylState = {

}

/**
 *
 */

class PhenylState {
  constructor(plain: PlainPhenylState) {
  }

  /**
   *
   */
  $update(command: UpdateCommand): PhenylState {
    return assign(this, command.operators)
  }


}
