// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';

import { Task, TasksQuery, CombinedState } from 'reducers/interfaces';

import DetectronPageComponent from 'components/detectron-page/detectron-page';

import { getTasksAsync, hideEmptyTasks } from 'actions/tasks-actions';

interface StateToProps {
    tasksFetching: boolean;
    gettingQuery: TasksQuery;
    numberOfTasks: number;
    numberOfVisibleTasks: number;
    numberOfHiddenTasks: number;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const { tasks } = state;
    return {
        tasksFetching: state.tasks.fetching,
        gettingQuery: tasks.gettingQuery,
        numberOfTasks: state.tasks.count,
        numberOfVisibleTasks: state.tasks.current.length,
        numberOfHiddenTasks: tasks.hideEmpty ?
            tasks.current.filter((task: Task): boolean => !task.instance.jobs.length).length :
            0,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        onGetTasks: (query: TasksQuery): void => {
            dispatch(getTasksAsync(query));
        },
        hideEmptyTasks: (hideEmpty: boolean): void => {
            dispatch(hideEmptyTasks(hideEmpty));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DetectronPageComponent);
