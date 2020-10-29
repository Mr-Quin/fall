module.exports = function override(config, env) {
    config.module.rules[2].oneOf.splice(1, 0, {
        test: /\.(gltf|glb)$/i,
        loader: require.resolve('file-loader'),
        options: {
            name: '[hash].[ext]',
        },
    })
    return config
}
