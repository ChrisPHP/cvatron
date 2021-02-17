// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React from 'react';
import './styles.scss';

import Menu from 'antd/lib/menu';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';

import { Row } from 'antd/lib/grid';
import { Upload, Form, Button } from 'antd';

const { SubMenu } = Menu;

export default function DetectronPageComponent(): JSX.Element {
    return (
        <Row justify='center' align='top'>
            <Row justify='space-between' align='middle'>
                <Form name='basic'>
                    <Form.Item name='project' rules={[{ required: true, message: 'Please choose a project!' }]}>
                        <Menu style={{ width: 256 }} defaultSelectedKeys={['1']} mode='inline'>
                            <SubMenu key='proj1' title='Choose a Project'>
                                <Menu.Item key='1'>Option 1</Menu.Item>
                                <Menu.Item key='2'>Option 2</Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Form.Item>
                    <Form.Item name='username' rules={[{ required: true, message: 'Please input your username!' }]}>
                        <Menu style={{ width: 256 }} defaultSelectedKeys={['1']} mode='inline'>
                            <SubMenu key='sub1' title='COCO Dataset'>
                                <SubMenu key='sub1-2' title='Faster R-CNN'>
                                    <Menu.Item key='1'>Option 1</Menu.Item>
                                    <Menu.Item key='2'>Option 1</Menu.Item>
                                </SubMenu>
                                <SubMenu key='sub1-3' title='RetinaNet'>
                                    <Menu.Item key='3'>Option 1</Menu.Item>
                                    <Menu.Item key='4'>Option 1</Menu.Item>
                                </SubMenu>
                                <SubMenu key='sub1-4' title='RPN & Fast R-CNN'>
                                    <Menu.Item key='5'>Option 1</Menu.Item>
                                    <Menu.Item key='6'>Option 1</Menu.Item>
                                </SubMenu>
                            </SubMenu>
                        </Menu>
                    </Form.Item>

                    <Form.Item name='iterations' rules={[{ required: true, message: 'Please input your username!' }]}>
                        <Input placeholder='iterations' />
                    </Form.Item>

                    <Form.Item name='batch' rules={[{ required: true, message: 'Please input your username!' }]}>
                        <Input placeholder='Batch Size' />
                    </Form.Item>

                    <Form.Item name='resume'>
                        <Checkbox>Resume train</Checkbox>
                    </Form.Item>

                    <Form.Item name='submit'>
                        <Button type='primary' htmlType='submit'>
                            Train
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
            <Row justify='space-between' align='middle'>
                <Form name='basic'>
                    <Form.Item name='test-images'>
                        <Upload>
                            <Button>Upload Test Images</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item name='threshold'>
                        <Input placeholder='threshold' />
                    </Form.Item>
                    <Form.Item name='output'>
                        <Input placeholder='output dir' />
                    </Form.Item>
                    <Form.Item name='submit'>
                        <Button type='primary' htmlType='submit'>
                            Test
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </Row>
    );
}
