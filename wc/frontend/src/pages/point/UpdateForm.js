import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as Actions from '../../actions';
import * as UI from '../../components/UIKit';
import {browserHistory} from 'react-router'

import Form from './Form';

let mapData = (state) => {
    return {
            initialValues: state.main.hasIn(['point','response']) ? state.main.getIn(['point','response']).toJS() : null,

    }
}

let mapDispatch = (dispatch) => {
  return {

    actions: {
      fetch: (id) => {
        dispatch(Actions.Fetch("point", "/api/points/" + id));
      },
      save: (data) => {
        data = data.toJS();
        dispatch(Actions.Put("point", "/api/points/" + data.point_id, data));
      },
      change: (object) => {
        dispatch(Actions.ObjectMerge("point", {response: object, dirty:true}));
      },
      close: () => {
        browserHistory.replace("/points");
      }
    }
  }
}

export default connect(mapData, mapDispatch)(Form)
