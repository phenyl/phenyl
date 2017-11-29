import React from 'react'
import { Button, Menu } from 'semantic-ui-react'

type Props = {
  version: string,
  userName: string,
  onLogout: () => any,
}

const Information = ({ version, userName, onLogout }: Props) => (
  <Menu.Item name='home'>
    <div className="header">Phenyl Explorer v{version}</div>
    <div className="menu">
      {userName && (
        <Menu.Item>
          Login as <strong>{userName}</strong>
          <Button size='mini' compact onClick={onLogout}>Logout</Button>
        </Menu.Item>
      )}
    </div>
  </Menu.Item>
)

export default Information
