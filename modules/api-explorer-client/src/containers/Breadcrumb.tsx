import React from 'react'
import { Breadcrumb as SemanticBreadcrumb } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

type Props = {
  match: any,
}

export const Breadcrumb = ({ match }: Props) => (
  <SemanticBreadcrumb>
    {match.url.split('/').reduce((acc, path, i) => {
      if (i === 0) {
        return acc.concat([
          <SemanticBreadcrumb.Section
            key={`${path}-section`}
            link
          >
            Home
          </SemanticBreadcrumb.Section>,
        ])
      }

      return acc.concat([
        <SemanticBreadcrumb.Divider
          key={`${path}-divider`}
          icon='right angle'
        />,
        <SemanticBreadcrumb.Section
          key={`${path}-section`}
        >
          {path}
        </SemanticBreadcrumb.Section>,
      ])
    }, [])}
  </SemanticBreadcrumb>
)

const mapStateToProps = (): Props => ({
})

export default withRouter(connect(mapStateToProps)(Breadcrumb))
