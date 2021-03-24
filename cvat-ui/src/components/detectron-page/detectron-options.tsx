// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React from 'react';

export interface OptionsListProps {
    currentTasksIndexes: number[];
    numberOfTasks: number;
}

export default function DetectronOptionsComponent(props: OptionsListProps) {
    const { currentTasksIndexes } = props;

    return (
        <>
            <p>{currentTasksIndexes}</p>
        </>
    );
}
