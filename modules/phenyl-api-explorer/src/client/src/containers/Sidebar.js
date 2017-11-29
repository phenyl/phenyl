/* global EntitiesDefinition */
import React from 'react'
import { Sidebar as SemanticSidebar, Menu } from 'semantic-ui-react'
import { connect } from 'react-redux'
import Information from '../components/Sidebar/Information'
import FunctionalGroup from '../components/Sidebar/FunctionalGroup'
import { logout } from '../modules/user'
import pkg from '../../package.json'

type Props = {
  logout: () => void,
}

export const Sidebar = ({ version, userName, logout }: Props) => (
  <SemanticSidebar as={Menu} visible icon='labeled' vertical inverted className="fixed">
    <Information version={version} userName={userName} onLogout={logout} />
    <FunctionalGroup groupName={'users'} functionalNames={Object.keys(EntitiesDefinition.users)} />
    <FunctionalGroup groupName={'nonUsers'} functionalNames={Object.keys(EntitiesDefinition.nonUsers)} />
    <FunctionalGroup groupName={'customQueries'} functionalNames={Object.keys(EntitiesDefinition.customQueries)} />
    <FunctionalGroup groupName={'customCommands'} functionalNames={Object.keys(EntitiesDefinition.customCommands)} />
  </SemanticSidebar>
)

const mapStateToProps = (state): Props => {
  let displayName = null
  if (state.user.anonymous) {
    displayName = '(anonymous)'
  } else if (state.user.session) {
    displayName = state.user.displayName
  }

  return {
    version: pkg.version,
    userName: displayName,
  }
}

const mapDispatchToProps = (dispatch) => ({
  logout () {
    dispatch(logout())
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
