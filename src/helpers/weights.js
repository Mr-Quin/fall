import { tensor } from '../assets'

export default [
    {
        paths: [tensor.substring(1)],
        weights: [
            {
                dtype: 'float32',
                shape: [512],
                name: 'phero_model/decoder/rnn/rnn/multi_rnn_cell/cell_1/lstm_cell/bias',
            },
            {
                dtype: 'float32',
                shape: [512],
                name: 'phero_model/decoder/rnn/rnn/multi_rnn_cell/cell_0/lstm_cell/bias',
            },
            {
                dtype: 'float32',
                shape: [123, 128],
                name: 'phero_model/decoder/rnn_input/dense/kernel',
            },
            {
                dtype: 'float32',
                shape: [256, 512],
                name: 'phero_model/decoder/rnn/rnn/multi_rnn_cell/cell_1/lstm_cell/kernel',
            },
            {
                dtype: 'float32',
                shape: [128, 88],
                name: 'phero_model/decoder/pitches/dense/kernel',
            },
            {
                dtype: 'float32',
                shape: [256, 512],
                name: 'phero_model/decoder/rnn/rnn/multi_rnn_cell/cell_0/lstm_cell/kernel',
            },
            {
                dtype: 'float32',
                shape: [88],
                name: 'phero_model/decoder/pitches/dense/bias',
            },
            {
                dtype: 'float32',
                shape: [128],
                name: 'phero_model/decoder/rnn_input/dense/bias',
            },
        ],
    },
]
