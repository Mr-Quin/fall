module.exports = function override(config, env) {
    //do stuff with the webpack config...
    config.module.rules[2].oneOf.splice(1, 0, {
        test: /\.(gltf|glb)$/i,
        loader: require.resolve('file-loader'),
        options: {
            name: '[hash].[ext]',
        },
    })
    console.log(config.module.rules[2].oneOf)
    return config
}
