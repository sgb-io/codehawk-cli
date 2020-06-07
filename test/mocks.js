const fs = require('fs')
const path = require('path')

const getSource = (target) => fs.readFileSync(path.resolve(__dirname, target))

const sourcesPath = '../samples/'

const samples = [
    {
        filename: 'simple-class.js',
        filepath: `${sourcesPath}simple-class/simple-class.js`,
        options: {},
    },
    {
        filename: 'simple-es6-imports.js',
        filepath: `${sourcesPath}simple-es6-imports/simple-es6-imports.js`,
        options: {},
    },
    {
        filename: 'PopoutMenu.jsx',
        filepath: `${sourcesPath}react-component/PopoutMenu.jsx`,
        options: {},
    },
    {
        filename: 'Button.jsx',
        filepath: `${sourcesPath}react-component-flow/Button.jsx`,
        options: {},
    }
]

module.exports = {
    sampleFiles: {
        files: samples.map(f => ({
            path: sourcesPath,
            filename: f.filename,
            rawSource: getSource(f.filepath),
            options: f.options,
        }))
    }
}
