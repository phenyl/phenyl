import React from 'react'
import { Form } from 'semantic-ui-react'

type Props = {
  operations: Array<string>,
  defaultPayload: string,
  execute: ({ entitiName: string, operation: string, payload: any }) => any,
}

const OperationEditor = ({ execute, operations, defaultPayload }: Props) => (
  <div>
    <Form>
      <Form.Group>
        <Form.Select
          label='Operation'
          options={operations.map(op => ({
            key: op,
            text: op,
            value: op,
          }))}
          defaultValue={operations[0]}
        />
      </Form.Group>
      <Form.TextArea
        label='Payload'
        defaultValue={JSON.stringify(defaultPayload, null, 2)}
      >
      </Form.TextArea>
      <Form.Button positive onClick={() => execute({ entityName: 'patient', operation: 'find', payload: { where: {} } })}>Run</Form.Button>
    </Form>
  </div>
)

export default OperationEditor
