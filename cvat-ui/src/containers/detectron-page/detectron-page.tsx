// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';

import DetectronPageComponent from 'components/detectron-page/detectron-page';

function mapStateToProps(): StateToProps {
    return {};
}

export default connect(mapStateToProps, {})(DetectronPageComponent);
