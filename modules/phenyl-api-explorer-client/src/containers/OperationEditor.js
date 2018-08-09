import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import OperationEditor from '../components/OperationEditor'
import { operations } from '../UIMeta'
import { execute } from '../modules/operation'

const mapStateToProps = (state) => ({
  sessionId: state.user.session ? state.user.session.id : null,
  operations: operations.map(op => op.name),
  defaultPayloads: operations.reduce((acc, op) => ({
    ...acc,
    [op.name]: op.defaultPayload,
  }), {}),
})

const mapDispatchToProps = (dispatch) => ({
  execute ({ sessionId, entityName, method, payload }) {
    dispatch(execute({ sessionId, entityName, method, payload }))
  },
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OperationEditor))
