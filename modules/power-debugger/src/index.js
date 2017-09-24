// @flow

export default class PowerDebugger {

  static startDebugging<T: Object | Function>(target: T, options?: Object): T {
    if (typeof target === 'object') {
      return this.startDebuggingObject(target)
    }
    return this.startDebuggingFunction(target)
  }

  static startDebuggingObject<T: Object>(target: T): T {
    // TODO
    return target
  }

  static startDebuggingFunction<T: Function>(target: T): T {
    // TODO
    return target
  }
}
