// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React from 'react';
import './styles.scss';
import { withRouter } from 'react-router-dom';

import Input from 'antd/lib/input';

import { Row } from 'antd/lib/grid';
import {
    Form, Button, Divider, Select,
} from 'antd';

const { Option } = Select;

interface TasksPageProps {
    tasksFetching: boolean;
    gettingQuery: TasksQuery;
    numberOfTasks: number;
    numberOfVisibleTasks: number;
    numberOfHiddenTasks: number;
    onGetTasks: (gettingQuery: TasksQuery) => void;
    hideEmptyTasks: (hideEmpty: boolean) => void;
}

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

class TaskPageComponent extends React.PureComponent<Props> {
    public componentDidMount(): void {
        const { gettingQuery, location, onGetTasks } = this.props;
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

    onFinishTrain = (values: any) => {
        console.log('Success', values);

        fetch('http://localhost:4000/Train', {
            mode: 'no-cors',
            method: 'POST',
            body: JSON.stringify(values),
        }).then((response) => {
            console.log('test', response);
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

                        <Form id='TrainForm' onFinish={this.onFinishTrain}>
                            <Form.Item name='Task'>
                                <Select placeholder='Select a Task'>
                                    <Option value='task1'>A task</Option>
                                </Select>
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
                            <Button type='primary' htmlType='submit' onClick={() => this.SubmitForms()}>
                                Train
                            </Button>
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
