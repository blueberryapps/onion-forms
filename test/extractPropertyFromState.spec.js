import { fromJS } from 'immutable';

import extractPropertyFromState from '../src/extractPropertyFromState';

describe('extractPropertyFromState()', () => {
  const state = {
    onionForm: fromJS({
      fields: {
        Form1: {
          foo: { value: 'Bar', missingProp: true },
          bar: { value: 'Foo', }
        }
      }
    })
  };

  it('extract property from nonexisting form', () => {
    expect(extractPropertyFromState(state, 'NonexistingForm', 'value'))
      .toEqual({});
  });

  it('extract property from form fields', () => {
    expect(extractPropertyFromState(state, 'Form1', 'value')).toEqual({
      foo: 'Bar',
      bar: 'Foo'
    });
  });

  it('extract property from form fields which is sometimes missing', () => {
    expect(extractPropertyFromState(state, 'Form1', 'missingProp')).toEqual({
      foo: true,
      bar: null
    });
  });
});
