import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Response from '../components/OperationResult/Response'

type Props = {
  loading: boolean,
  expanded: boolean,
  data: any,
}

const mapStateToProps = (state): Props => ({
  expanded: true,
  spent: state.operation.spent,
  loading: state.operation.isFetching,
  response: state.operation.response,
  error: state.operation.error,
})

export default withRouter(connect(mapStateToProps)(Response))
