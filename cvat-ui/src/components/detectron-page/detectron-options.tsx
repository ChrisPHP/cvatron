// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React from 'react';
import { Select } from 'antd';

export interface OptionsListProps {
    currentTasksIndexes: number[];
    numberOfTasks: number;
    TaskName: string[];
}

const { Option } = Select;

export default function DetectronOptionsComponent(props: OptionsListProps) {
    const { currentTasksIndexes, TaskName } = props;

    return (
        <>
            <Select placeholder='Select a Task'>
                <Option value={currentTasksIndexes}>{TaskName}</Option>
            </Select>
        </>
    );
}
