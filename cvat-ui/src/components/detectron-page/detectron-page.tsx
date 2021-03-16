// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React from 'react';
import './styles.scss';
import { withRouter } from 'react-router-dom';

import Input from 'antd/lib/input';

import { Row } from 'antd/lib/grid';
import {
    Upload, Form, Button, Divider, Select,
} from 'antd';

const { Option } = Select;

class TaskPageComponent extends React.PureComponent<Props> {
    onFinishTrain = (values: any) => {
        console.log('Success', values);

        fetch('http://localhost:4000/Train', {
            method: 'POST',
            body: JSON.stringify(values),
        }).then((response) => {
            console.log('test', response);
            alert('finished train');
            return response.json();
        });
    };

    onFinishTest = (values: any) => {
        console.log('Success', values);

        fetch('http://localhost:4000/Test', {
            method: 'POST',
            body: JSON.stringify(values),
        }).then((response) => {
            console.log(response);
            alert('Finished Tests');
            return response.json();
        });
    };

    public render(): JSX.Element {
        return (
            <>
                <Row justify='center' align='top'>
                    <Row className='train-test' justify='space-between' align='middle'>
                        <Divider>Training</Divider>
                        <Form onFinish={this.onFinishTrain}>
                            <Form.Item name='Task'>
                                <Select placeholder='Select a Task'>
                                    <Option value='task1'>A task</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name='task_images'>
                                <Upload>
                                    <Button>Upload Task Images</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item name='task_annotated'>
                                <Upload>
                                    <Button>Upload annotated images</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item name='Dataset'>
                                <Select placeholder='Select a Dataset'>
                                    <Option value='COCO-InstanceSegmentation/mask_rcnn_R_101_FPN_3x.yaml'>
                                        Mask RCNN 101 FPN
                                    </Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label='Number of Workers'
                                name='Workers'
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label='IMS per batch'
                                name='Ims'
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label='Learning Rate'
                                name='LearnRate'
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label='Iterations'
                                name='Iterations'
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label='Batch size'
                                name='BatchSize'
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label='Number of classifiers'
                                name='NumClassifiers'
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item name='ResumeTrain'>
                                <Select placeholder='Resume Train'>
                                    <Option value='True'>True</Option>
                                    <Option value='False'>False</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name='submit'>
                                <Button type='primary' htmlType='submit'>
                                    Train
                                </Button>
                            </Form.Item>
                        </Form>
                    </Row>

                    <Row className='train-test' justify='space-between' align='middle'>
                        <Divider>Testing</Divider>
                        <Form onFinish={this.onFinishTest}>
                            <Form.Item name='Task'>
                                <Select placeholder='Select a Task'>
                                    <Option value='task1'>A task</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name='task_images'>
                                <Upload>
                                    <Button>Upload Task Images</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item name='task_annotated'>
                                <Upload>
                                    <Button>Upload annotated images</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item name='Dataset'>
                                <Select placeholder='Select a Dataset'>
                                    <Option value='COCO-InstanceSegmentation/mask_rcnn_R_101_FPN_3x.yaml'>
                                        Mask RCNN R 101 FPN
                                    </Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label='Threshold' name='Threshold'>
                                <Input />
                            </Form.Item>
                            <Form.Item label='Output Directory' name='Output'>
                                <Input />
                            </Form.Item>
                            <Form.Item name='submit'>
                                <Button type='primary' htmlType='submit'>
                                    Test
                                </Button>
                            </Form.Item>
                        </Form>
                    </Row>
                </Row>
            </>
        );
    }
}

export default withRouter(TaskPageComponent);
