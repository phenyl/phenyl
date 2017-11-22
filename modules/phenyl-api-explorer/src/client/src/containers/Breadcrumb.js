import React from 'react'
import { Breadcrumb as SemanticBreadcrumb } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

type Props = {
  match: any,
}

export const Breadcrumb = ({ match, ...all }) => (
  <SemanticBreadcrumb>
    {match.url.split('/').reduce((acc, path, i) => {
      if (i === 0) {
        return acc.concat([
          <SemanticBreadcrumb.Section link>Home</SemanticBreadcrumb.Section>,
        ])
      }

      return acc.concat([
        <SemanticBreadcrumb.Divider icon='right angle' />,
        <SemanticBreadcrumb.Section>{path}</SemanticBreadcrumb.Section>,
      ])
    }, [])}
  </SemanticBreadcrumb>
)

const mapStateToProps = (state): Props => ({
})

export default withRouter(connect(mapStateToProps)(Breadcrumb))
