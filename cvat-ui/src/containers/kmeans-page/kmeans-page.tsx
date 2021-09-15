// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';

import { Task, TasksQuery, CombinedState } from 'reducers/interfaces';

import KmeansPageComponent, { Actions } from 'components/kmeans-page/kmeans-page';

import { exportDatasetAsync, getTasksAsync, hideEmptyTasks } from 'actions/tasks-actions';


interface StateToProps {
    tasksFetching: boolean;
    gettingQuery: TasksQuery;
    numberOfTasks: number;
    numberOfVisibleTasks: number;
    numberOfHiddenTasks: number;
}

interface DispatchToProps {
    exportDataset: (taskInstance: any, exporter: any) => void;
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
        exportDataset: (taskInstance: any, exporter: any): void => {
            dispatch(exportDatasetAsync(taskInstance, exporter));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(KmeansPageComponent);
