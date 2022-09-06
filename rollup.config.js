const glob = require('glob')

var tsFiles = glob.sync('!(node_modules)/**/*.ts').map(fileName => fileName.substring(0, fileName.length - 2) + 'js')

console.log('[rollup] generating up the following files: ' + tsFiles.map(a => '\n\t' + a))

export default tsFiles.map(fileName => {
    return {
        input: fileName,
        output: {
            file: fileName,
            format: 'iife',
        },
        onwarn: (warning, warnHandler) => {
            if(
            !(warning.code === 'UNRESOLVED_IMPORT') &&
            !(warning.code === 'MISSING_GLOBAL_NAME')
            ){
                warnHandler(warning)
            }
        },
    }
})
