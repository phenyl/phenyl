import React from "react";
import { Segment, Tab, Message } from "semantic-ui-react/index";
import JSONTree from "react-json-tree";

type Props = {
  loading: boolean,
  expanded: boolean,
  response: any,
  error: ?Error
};

const Response = ({ loading, expanded, response, error }: Props) => {
  if (loading) {
    return <Segment loading className="result" />;
  } else if (error != null) {
    return (
      <Segment className="result">
        <Message negative>
          <Message.Header>{error.message}</Message.Header>
          <pre>{error.stack}</pre>
        </Message>
      </Segment>
    );
  } else if (response != null) {
    return (
      <Tab
        className="result"
        panes={[
          {
            menuItem: "Tree view",
            // eslint-disable-next-line react/display-name
            render: () => (
              <Tab.Pane>
                <JSONTree
                  hideRoot
                  shouldExpandNode={() => expanded}
                  data={response}
                />
              </Tab.Pane>
            )
          },
          {
            menuItem: "Raw JSON",
            // eslint-disable-next-line react/display-name
            render: () => (
              <Tab.Pane>
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </Tab.Pane>
            )
          }
        ]}
      />
    );
  }

  return null;
};

export default Response;
