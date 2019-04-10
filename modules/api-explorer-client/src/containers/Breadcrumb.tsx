import React from "react";
import { Breadcrumb as SemanticBreadcrumb } from "semantic-ui-react/index";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

type Props = {
  match?: any;
};

export const Breadcrumb = ({ match }: Props) => (
  <SemanticBreadcrumb>
    {match.url
      .split("/")
      .reduce((acc: Array<any>, path: string, i: number) => {
        if (i === 0) {
          return acc.concat([
            <SemanticBreadcrumb.Section key={`${path}-section`} link>
              Home
            </SemanticBreadcrumb.Section>
          ]);
        }

        return acc.concat([
          <SemanticBreadcrumb.Divider
            key={`${path}-divider`}
            icon="right angle"
          />,
          <SemanticBreadcrumb.Section key={`${path}-section`}>
            {path}
          </SemanticBreadcrumb.Section>
        ]);
      }, [])}
  </SemanticBreadcrumb>
);

const mapStateToProps = (): Props => ({});

// @ts-ignore: something wrong with react-router-dom
export default withRouter(connect(mapStateToProps)(Breadcrumb));
