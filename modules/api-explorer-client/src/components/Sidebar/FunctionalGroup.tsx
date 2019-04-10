import React from "react";
import { Menu } from "semantic-ui-react/index";
import { Link } from "react-router-dom";

type Props = {
  groupName: string;
  functionalNames: Array<string>;
};

const FunctionalGroup = ({ groupName, functionalNames }: Props) => (
  <Menu.Item key={groupName} name={groupName}>
    <div className="header">{groupName}</div>
    <div className="menu">
      {functionalNames.map(functionalName => (
        <Menu.Item
          key={functionalName}
          as={Link}
          to={`/${groupName}/${functionalName}`}
        >
          {functionalName}
        </Menu.Item>
      ))}
    </div>
  </Menu.Item>
);

export default FunctionalGroup;
