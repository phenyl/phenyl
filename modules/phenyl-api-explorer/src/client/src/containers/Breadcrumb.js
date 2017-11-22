import React from 'react'
import { Breadcrumb as SemanticBreadcrumb } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

type Props = {
  location: any,
}

export const Breadcrumb = ({ location }) => (
  <SemanticBreadcrumb>
    <SemanticBreadcrumb.Section link>Home</SemanticBreadcrumb.Section>
    <SemanticBreadcrumb.Divider icon='right angle' />
    <SemanticBreadcrumb.Section>User</SemanticBreadcrumb.Section>
    <SemanticBreadcrumb.Divider icon='right angle' />
    <SemanticBreadcrumb.Section active>Patient</SemanticBreadcrumb.Section>
  </SemanticBreadcrumb>
)

const mapStateToProps = (state): Props => ({
  location: state.location,
})

export default withRouter(connect(mapStateToProps)(Breadcrumb))
