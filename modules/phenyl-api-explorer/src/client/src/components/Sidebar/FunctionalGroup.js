import React from 'react'
import { Menu } from 'semantic-ui-react'

type Props = {
  groupName: string,
  functionalNames: Array<string>,
}

const FunctionalGroup = ({ groupName, functionalNames }: Props) => (
  <Menu.Item name={groupName}>
    <div className="header">{groupName}</div>
    <div className="menu">
      {functionalNames.map(functionalName => (
        <Menu.Item as='a'>{functionalName}</Menu.Item>
      ))}
    </div>
  </Menu.Item>
)

export default FunctionalGroup
