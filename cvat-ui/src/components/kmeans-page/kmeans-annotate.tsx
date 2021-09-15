import React, { Component } from "react";
import Annotation from "react-image-annotation";
import {
  PointSelector,
  RectangleSelector,
  OvalSelector
} from "react-image-annotation/lib/selectors";

import { Row } from 'antd/lib/grid';
import {
    Button, Col,
} from 'antd';

export default class KmeansAnnotate extends Component {
  state = {
    annotations: [],
    annotation: {},
    tool: RectangleSelector
  };

  onSubmit = (annotation) => {
    const { geometry, data } = annotation

    this.setState({
      annotation: {},
      annotations: this.state.annotations.concat({
        geometry,
        data: {
          ...data,
          id: Math.random()
        }
      })
    })
  }

  getToolbarItem = selector => {
    return (
      <Button
        type='primary'
        className={this.state.tool === selector ? "selected-tool" : ""}
        onClick={() => this.setState({ tool: selector })}
      >
        {selector.TYPE}
      </Button>
    );
  };

  render = () => {
    const { tool } = this.state;
    return (
      <>
          <div className="toolbar">
              {this.getToolbarItem(RectangleSelector)}
              {this.getToolbarItem(PointSelector)}
              {this.getToolbarItem(OvalSelector)}
          </div>
        <Annotation
            src={this.props.img}

            annotations={this.state.annotations}

            type={tool.TYPE}
            value={this.state.annotation}
            onChange={value => this.setState({ annotation: value })}
            onSubmit={this.onSubmit}
        />
      </>
    );
  };
}
