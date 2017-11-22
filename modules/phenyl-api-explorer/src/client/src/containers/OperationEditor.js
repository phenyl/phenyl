import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import OperationEditor from '../components/OperationEditor'
import { operations } from '../UIMeta'
import { execute } from '../modules/operation'

const mapStateToProps = (state) => ({
  operations: operations.map(op => op.name),
  defaultPayload: operations[0].defaultPayload,
})

const mapDispatchToProps = (dispatch) => ({
  execute ({ entityName, operation, payload }) {
    dispatch(execute({ entityName, operation, payload }))
  },
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OperationEditor))
