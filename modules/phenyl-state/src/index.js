// @flow
import type {
  UpdateCommand
} from 'phenyl-interfaces'

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
    return new PhenylState({})
  }


}
