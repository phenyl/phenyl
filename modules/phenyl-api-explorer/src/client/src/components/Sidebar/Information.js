import React from 'react'
import { Button, Menu } from 'semantic-ui-react'

type Props = {
  version: string,
  user: User,
}

const Information = ({ version, user }: Props) => (
  <Menu.Item name='home'>
    <div className="header">Phenyl Explorer v{version}</div>
    <div className="menu">
      <Menu.Item>
        Login as <strong>{'Leko'}</strong>
        <Button size='mini' compact>Logout</Button>
      </Menu.Item>
    </div>
  </Menu.Item>
)

export default Information
