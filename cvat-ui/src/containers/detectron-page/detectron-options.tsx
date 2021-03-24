// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import React from 'react';
import { connect } from 'react-redux';

import { TasksState, TasksQuery, CombinedState } from 'reducers/interfaces';

import DetectronOptions from 'components/detectron-page/detectron-options';

import { getTasksAsync } from 'actions/tasks-actions';

interface StateToProps {
    tasks: TasksState;
}

interface DispatchToProps {
    getTasks: (query: TasksQuery) => void;
}

interface OwnProps {
    onSwitchPage: (page: number) => void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    return {
        tasks: state.tasks,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        getTasks: (query: TasksQuery): void => {
            dispatch(getTasksAsync(query));
        },
    };
}

type DetectronOptionsContainerProps = StateToProps & DispatchToProps & OwnProps;

function DetectronOptionsContainer(props: DetectronOptionsContainerProps): JSX.Element {
    const { tasks } = props;

    return (
        <DetectronOptions
            currentTasksIndexes={tasks.current.map((task): number => task.instance.id)}
            numberOfTasks={tasks.count}
        />
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(DetectronOptionsContainer);
