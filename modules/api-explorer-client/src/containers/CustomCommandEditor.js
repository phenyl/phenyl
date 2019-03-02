import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import CustomEditor from '../components/CustomEditor'
import { runCustomCommand } from '../modules/operation'

const mapStateToProps = (state) => ({
  sessionId: state.user.session ? state.user.session.id : null,
  isFetching: state.operation.isFetching,
})

const mapDispatchToProps = (dispatch) => ({
  execute ({ sessionId, name, params }) {
    dispatch(runCustomCommand({ sessionId, name, params }))
  },
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomEditor))
