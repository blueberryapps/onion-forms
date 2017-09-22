import * as actions from '../src/actions';
import connectField from '../src/connectField';
import TestUtils from 'react-addons-test-utils';
import Form from '../src/Form.react';
import reducer from '../src/reducer';
import React, { Component } from 'react';
import sinon from 'sinon';
import { createStore } from 'redux';
import { jsdom } from 'jsdom';
import { Provider as ReduxProvider } from 'react-redux';

const initial = {
  onionForm: {
    fields: {
      OnionForm: {
        firstName: {
          customProperty: 'Hi Hello From State',
          value: 'Foo',
          error: 'required'
        },
        lastName: {}
      }
    }
  }
};

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;

const TextField = (props) => (<input type="text" {...props} />);

describe('Form', () => {
  class Passthrough extends Component {
    static contextTypes = {
      onionFieldRegister: React.PropTypes.func,
      onionFormName: React.PropTypes.string,
      onionLiveValidate: React.PropTypes.func,
      onionOnSubmit: React.PropTypes.func
    }

    render() {
      return <div />;
    }
  }

  const isRequired = () => (value) => ((!value) ? 'required' : null);
  const onSubmit = sinon.stub();
  const onError = sinon.stub();
  const validations = {
    firstName: [isRequired()],
    lastName: [isRequired()]
  };

  const createContainer = (validations) => {
    const store = createStore((state, action) => ({ onionForm: reducer(state.onionForm, action) }), initial);
    return TestUtils.renderIntoDocument(
      <ReduxProvider store={store}>
        <Form name="OnionForm" validations={validations} onSubmit={onSubmit} onError={onError}>
          <Passthrough />
        </Form>
      </ReduxProvider>
    );
  };

  const container = createContainer(validations);
  const passthrough = TestUtils.findRenderedComponentWithType(container, Passthrough);
  const form = TestUtils.findRenderedComponentWithType(container, Form);
  const passthroughCtx = passthrough.context;

  it('should pass onionFormName in context to children', () => {
    expect(passthroughCtx.onionFormName).toBe('OnionForm');
  });

  it('should pass onionLiveValidate in context to children', () => {
    expect(typeof passthroughCtx.onionLiveValidate).toBe('function');
  });

  it('should pass onionLiveValidate in context to children', () => {
    expect(typeof passthroughCtx.onionLiveValidate).toBe('function');
  });

  it('should pass onionOnSubmit in context to children', () => {
    expect(typeof passthroughCtx.onionOnSubmit).toBe('function');
  });

  it('should pass onionFieldRegister in context to children', () => {
    expect(typeof passthroughCtx.onionFieldRegister).toBe('function');
  });

  it('should have validate()', () => {
    expect(typeof form.validate).toBe('function');
  });

  it('should have onSubmit()', () => {
    expect(typeof form.onSubmit).toBe('function');
  });

  it('should have liveValidate()', () => {
    expect(typeof form.liveValidate).toBe('function');
  });

  it('should have formValidate()', () => {
    expect(typeof form.formValidate).toBe('function');
  });

  it('should have fieldRegister()', () => {
    expect(typeof form.fieldRegister).toBe('function');
  });

  it('should dispatch right action on formValidate()', () => {
    expect(form.formValidate().type).toBe(actions.SET_ONION_FORM_MULTIPLE_FIELDS);
    expect(form.formValidate().property).toBe('error');
  });

  describe('_submit()', () => {
    const containerWithoutValidations = createContainer({});
    const formWithoutValidations = TestUtils.findRenderedComponentWithType(containerWithoutValidations, Form);

    it('should call onSubmit() callback when form valid', () => {
      expect(formWithoutValidations._isValid()).toBe(true);
      expect(formWithoutValidations._submit()).toBe(true);
      sinon.assert.calledWith(onSubmit, {
        name: 'OnionForm',
        values: {
          firstName: 'Foo',
          lastName: null
        }
      });
    });

    it('should call onError() callback when form not valid', () => {
      expect(form._isValid()).toBe(false);
      expect(form._submit()).toBe(false);
      sinon.assert.calledWith(onError, {
        name: 'OnionForm',
        errors: {
          firstName: null,
          lastName: 'required'
        }
      });
    });
  });

  describe('formValidate()', () => {
    it('should validate fields', () => {
      expect(form.formValidate().values).toEqual({
        firstName: null,
        lastName: 'required'
      });
    });
  });

  describe('Validations on field level', () => {
    const failingValidation = () => 'ERROR';
    const passingValidation = () => null;
    const FirstName = connectField('firstName', {}, [isRequired()])(TextField);
    const LastName = connectField('lastName', {}, [isRequired()])(TextField);

    const createForm = (fields, formValidations) => {
      const store = createStore((state, action) => ({ onionForm: reducer(state.onionForm, action) }), initial);
      const container = TestUtils.renderIntoDocument(
        <ReduxProvider store={store}>
          <Form name="OnionForm" onSubmit={onSubmit} onError={onError} validations={formValidations}>
            {fields}
          </Form>
        </ReduxProvider>
      );
      return TestUtils.findRenderedComponentWithType(container, Form);
    };

    it('should pass for valid fields', () => {
      const form = createForm(<FirstName />);
      expect(form._isValid()).toBe(true);
    });

    it('should fail for invalid fields', () => {
      const form = createForm(<FirstName validations={[failingValidation]} />);
      expect(form._isValid()).toBe(false);
    });

    it('should fail for invalid fields', () => {
      const form = createForm(<LastName />);
      expect(form._isValid()).toBe(false);
    });

    it('all three types of validations should be used', () => {
      const form = createForm(<LastName validations={[passingValidation]} />, { lastName: [failingValidation] });
      const errors = form._extractValidationsFromField('lastName');
      expect(Object.keys(errors).length).toBe(3);
    });
  });
});
