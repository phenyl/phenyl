import React from 'react'
import { Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

type Props = {
  groupName: string,
  functionalNames: Array<string>,
}

const FunctionalGroup = ({ groupName, functionalNames }: Props) => (
  <Menu.Item name={groupName}>
    <div className="header">{groupName}</div>
    <div className="menu">
      {functionalNames.map(functionalName => (
        <Menu.Item as={Link} to={`/${groupName}/${functionalName}`}>{functionalName}</Menu.Item>
      ))}
    </div>
  </Menu.Item>
)

export default FunctionalGroup
