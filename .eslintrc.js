module.exports = {
    'env': {
        'commonjs': true,
        'es6': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'rules': {
        'indent': [
            'error',
            2
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-unused-vars': [
            'warn',
            { "vars": "all", "argsIgnorePattern": "bot", "args": "after-used", "ignoreRestSiblings": false }
        ],
        'padding-line-between-statements': [
            'error',
            { "blankLine": "always", "prev": "block-like", "next": "return" }
        ],
        'no-multiple-empty-lines': [
            'error',
            { "max": 1, "maxEOF": 1 }
        ],
        'eol-last': [
            "error", 
            "always"
        ]
    }
};