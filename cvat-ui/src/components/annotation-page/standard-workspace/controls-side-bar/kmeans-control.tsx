import React from 'react';
import Icon from '@ant-design/icons';

import { MergeIcon } from 'icons';
import { Canvas } from 'cvat-canvas-wrapper';
import CVATTooltip from 'components/common/cvat-tooltip';

export interface Props {
    canvasInstance: Canvas;
}

function KmeansControl(props: Props): JSX.Element {
    const { canvasInstance } = props;

    return (
        <CVATTooltip title='Kmeans clustering on image' placement='right'>
            <Icon className='cvat-fit-control' component={MergeIcon} onClick={(): void => canvasInstance.fit()} />
        </CVATTooltip>
    );
}

export default React.memo(KmeansControl);
