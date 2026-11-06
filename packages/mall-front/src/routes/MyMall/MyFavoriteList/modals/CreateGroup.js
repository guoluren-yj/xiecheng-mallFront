import React from 'react';
import { Form, IntlField, Icon } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

export default function CreateGroup({ initDs, group }) {
  return (
    <Observer>
      {() => (
        <>
          {initDs.records.map((record, index) => {
            return (
              <Form labelLayout="float" columns={1} record={record}>
                <div
                  style={{
                    position: 'relative',
                    marginBottom: index === initDs.records.length - 1 ? 0 : 20,
                  }}
                >
                  <IntlField
                    style={{ width: group ? 510 : 444, marginRight: 10 }}
                    name="categoryName"
                  />
                  <div
                    r-if={!group}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 444,
                      width: 64,
                    }}
                  >
                    <Icon
                      r-if={initDs.records.length > 1}
                      style={{
                        cursor: 'pointer',
                        lineHeight: '32px',
                        height: 32,
                        width: 32,
                        textAlign: 'center',
                      }}
                      type="delete_black-o"
                      onClick={() => initDs.remove(record)}
                    />
                    <Icon
                      r-if={index === initDs.records.length - 1}
                      style={{
                        cursor: 'pointer',
                        lineHeight: '32px',
                        height: 32,
                        width: 32,
                        textAlign: 'center',
                      }}
                      type="add"
                      onClick={() => initDs.create({})}
                    />
                  </div>
                </div>
              </Form>
            );
          })}
        </>
      )}
    </Observer>
  );
}
