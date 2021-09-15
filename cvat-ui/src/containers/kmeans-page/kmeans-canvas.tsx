// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';

import KmeansCanvasComponent, { Actions } from 'components/kmeans-page/kmeans-canvas';

export default connect()(KmeansCanvasComponent);
