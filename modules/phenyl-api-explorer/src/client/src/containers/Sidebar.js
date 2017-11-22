/* global EntitiesDefinition */
import React from 'react'
import { Sidebar as SemanticSidebar, Menu } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Information from '../components/Sidebar/Information'
import FunctionalGroup from '../components/Sidebar/FunctionalGroup'
import pkg from '../../package.json'

type Props = {

}

export const Sidebar = ({ version, user }: Props) => (
  <SemanticSidebar as={Menu} visible icon='labeled' vertical inverted className="fixed">
    <Information version={version} user={user} />
    <FunctionalGroup groupName={'users'} functionalNames={EntitiesDefinition.users} />
    <FunctionalGroup groupName={'nonUsers'} functionalNames={EntitiesDefinition.nonUsers} />
    <FunctionalGroup groupName={'customQueries'} functionalNames={EntitiesDefinition.customQueries} />
    <FunctionalGroup groupName={'customCommands'} functionalNames={EntitiesDefinition.customCommands} />
  </SemanticSidebar>
)

const mapStateToProps = (state): Props => ({
  version: pkg.version,
  user: {},
})

export default withRouter(connect(mapStateToProps)(Sidebar))
