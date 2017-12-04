module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parser": "babel-eslint",
    "plugins": [
      "flowtype"
    ],
    "extends": ["eslint:recommended", "prettier"],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "flowtype/define-flow-type": 1,
        "flowtype/use-flow-type": 1,
        "no-case-declarations": 0,
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-unused-vars": [
            "error",
            { "args": "none" }
        ],
        "quotes": [
            "error",
            "single",
            { "avoidEscape": true }
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};
