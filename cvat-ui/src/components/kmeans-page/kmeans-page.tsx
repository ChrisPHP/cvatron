// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React from 'react';
import Menu from 'antd/lib/menu';
import { withRouter } from 'react-router-dom';
import KmeansPageContainer from 'containers/kmeans-page/kmeans-page';
import KmeansAnnotateContainer from 'containers/kmeans-page/kmeans-annotate';
import KmeansCanvasComponent from 'containers/kmeans-page/kmeans-canvas';
import DetectronOptionsContainer from 'containers/detectron-page/detectron-options';

import ReactImageAnnotate from "react-image-annotate";


import './style.scss';
import Input from 'antd/lib/input';
import { Row } from 'antd/lib/grid';
import {
    Form, Button, Divider, Select,  Col, Slider
} from 'antd';

const { Option } = Select;

function updateQuery(previousQuery: TasksQuery, searchString: string): TasksQuery {
    const params = new URLSearchParams(searchString);
    const query = { ...previousQuery };
    for (const field of Object.keys(query)) {
        if (params.has(field)) {
            const value = params.get(field);
            if (value) {
                if (field === 'id' || field === 'page') {
                    if (Number.isInteger(+value)) {
                        query[field] = +value;
                    }
                } else {
                    query[field] = value;
                }
            }
        } else if (field === 'page') {
            query[field] = 1;
        } else {
            query[field] = null;
        }
    }
    return query;
}

class KmeansPageComponent extends React.PureComponent<Props> {
    state = {
      images: [],
      inc: 0,
      cur: '',
      send: '',
      org: '',
      cls: '',
      grn: '',
      ref: '',
      ano: '',
      imagesPro: [],
      opacStr: '10%',
      opacNum: 100,
  }

  public componentDidMount(): void {
      const { gettingQuery, location, onGetTasks, exportDataset } = this.props;
      const query = updateQuery(gettingQuery, location.search);
      onGetTasks(query);
  }

  public componentDidUpdate(prevProps: TasksPageProps & RouteComponentProps): void {
      const { location, gettingQuery, onGetTasks } = this.props;

      if (prevProps.location.search !== location.search) {
          // get new tasks if any query changes
          const query = updateQuery(gettingQuery, location.search);
          message.destroy();
          onGetTasks(query);
      }
  }

  createSelect = () => {
  }

  GetTaskImages = async (values: any) => {
    fetch('http://localhost:4000/Kmeans', {
      method: 'POST',
      body: JSON.stringify(values),
    })
    .then(response => response.json())
    .then(data =>{
      this.setState({
        images: data,
        imagesPro: data,
      })
      this.ChangeImage()
    })
    .catch((error) => {
      console.error(error);
    })
  }

  KmeansReflect = () => {
    fetch('http://localhost:4000/KmeansReflect',{
      method: 'POST'
    })
    .then(response => response.json())
    .then(data =>{
      console.log(data)
      alert("Kmeans completed!");
    })
    .catch((error) => {
      console.error(error);
    })
  }

  KmeansRun = async (values: any) => {
    fetch('http://localhost:4000/KmeansRun', {
      method: 'POST',
      body: JSON.stringify(values),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      alert("reflectance completed!");
      this.setState({
        imagesPro: data
      })
    })
  }

  ChangeImage = () => {
    const len = this.state.images.Name.length
    const x = this.state.inc
    if (this.state.imagesPro.Ref == null) {
      if (this.state.inc == len) {
        this.setState({
          inc: 1,
          cur: 'http://localhost:4000/static/original/' + this.state.images.Name[0],
          send: this.state.images.Name[0],
        })
      } else {
        this.setState({
          cur: 'http://localhost:4000/static/original/' + this.state.images.Name[x],
          inc: x + 1,
          send: this.state.images.Name[x],
        })
      }
    } else {
      if (this.state.inc == len) {
        this.setState({
          inc: 1,
          cur: 'http://localhost:4000/static/original/' + this.state.images.Name[0],
          cls: 'http://localhost:4000/static/process/' + this.state.imagesPro.Cls[0],
          grn: 'http://localhost:4000/static/process/' + this.state.imagesPro.Grn[0],
          ref: 'http://localhost:4000/static/reflect/' + this.state.imagesPro.Ref[0],
          send: this.state.images.Name[0],
        })
      } else {
        this.setState({
          cur: 'http://localhost:4000/static/original/' + this.state.images.Name[x],
          cls: 'http://localhost:4000/static/process/' + this.state.imagesPro.Cls[x],
          grn: 'http://localhost:4000/static/process/' + this.state.imagesPro.Grn[x],
          ref: 'http://localhost:4000/static/reflect/' + this.state.imagesPro.Ref[x],
          inc: x + 1,
          send: this.state.images.Name[x],
        })
      }
    }
    console.log(this.state.inc)
  }

  AnnotateImgGrn = () => {
    this.setState({
      ano: this.state.grn,
    })
  }

  AnnotateImgCls = () => {
    this.setState({
      ano: this.state.cls,
    })
  }

  ChangeOpacity = value => {
    this.setState({
      opacNum: value,
      opacStr: String(value) + '%',
    })
    console.log(value)
  }

    public render(): JSX.Element {
        return (
            <>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify='center' align='middle'>
                <Col className="gutter-row" span={9}>
                  <Form id="KmeansForm" onFinish={this.GetTaskImages}>
                    <DetectronOptionsContainer />
                    <Button type='primary' htmlType='submit'>
                      View
                    </Button>
                  </Form>

                <Button type='primary' onClick={this.KmeansReflect}>
                  Create Reflectance
                </Button>
              </Col>
            </Row>

            <hr />

            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify='center' align='middle'>
                <Col className="gutter-row" span={9}>
                  <Form id='OptionClasses' onFinish={this.KmeansRun}>
                    <Form.Item
                      name='Task'
                      label='Classes'
                    >
                      <Select placeholder='Select a Class'>
                        <Option value='4'>
                          4
                        </Option>
                        <Option value='5'>
                          5
                        </Option>
                        <Option value='6'>
                          6
                        </Option>
                        <Option value='7'>
                          7
                        </Option>
                        <Option value='8'>
                          8
                        </Option>
                        <Option value='9'>
                          9
                        </Option>
                        <Option value='10'>
                          10
                        </Option>
                      </Select>
                    </Form.Item>

                    <Button type='primary' htmlType='submit'>
                      Run Kmeans
                    </Button>
                  </Form>
                </Col>
              </Row>

            <hr />

            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify='center' align='middle'>
              <Col className="gutter-row" span={9} justify='center' align='middle'>
                <Button type='primary' onClick={this.ChangeImage}>
                  next image
                </Button>
                <a href='http://localhost:4000/static/' target="_blank">
                  <Button type='primary' onClick={this.AnnotateImgGrn}>
                    Annotate Image
                  </Button>
                </a>
              </Col>
            </Row>

            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify='center' align='middle'>
              <Col  className="gutter-row" span={12} justify='center' align='middle'>
                <h1>Original Image</h1>
                <img className="image1" src={this.state.cur} width="550px" height="300"/>
              </Col>
              <Col  className="gutter-row" span={12} justify='center' align='middle'>
                <h1>Reflectance Image</h1>
                <img className="image1" src={this.state.ref} width="550px" height="300"/>
              </Col>
              <Col  className="gutter-row" span={12} justify='center' align='middle'>
                <h1>Classifier Image</h1>
                <img className="image1" src={this.state.cls} width="550px" height="300"/>
              </Col>
              <Col  className="gutter-row" span={12} justify='center' align='middle'>
                <h1>Classes capturing green</h1>
                <img className="image1" src={this.state.grn} width="550px" height="300"/>
              </Col>
            </Row>
          </>
        );
    }
}

export default withRouter(KmeansPageComponent);
