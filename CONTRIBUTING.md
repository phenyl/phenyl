# Contributing
Why don't your make Phenyl better with your issue reports and pull requests? We're open to any contributions.

## Reporting Issues
- bugs
- requests for improvement
- questions

Currently, you can post any types of issues.
Please check [Issue tracker](https://github.com/phenyl-js/phenyl/issues) first to make sure your issue hasn't already been reported.

# Development
## Preparing environment for development
1. Fork, then clone the repository
2. Install the dependencies
3. Prepare monorepo settings

### Clone the repository
```bash
git clone https://github.com/your-username/phenyl.git
```

### Install the dependencies
```bash
cd phenyl
npm install
```

### Prepare monorepo settings
```bash
npm run load
```

This command does three jobs.

1. Make internal symlinks among phenyl modules.
2. Make symlinks of common tools like babel and testing frameworks in each module.
2. Install external dependencies for each module.

## Testing

After preparing monorepo settings, run the test to make sure your environment is normally built.

```bash
npm test
```
When your test failed, in most cases it's because you don't have `mongod` command.
Install it like the following way and retry the test.

```bash
# This example is for Mac users
brew update
brew install mongodb
```

### Test only the specified modules
Just specify the module(s) you want to test.

The following example shows how to run test in `power-assign` and `phenyl-memory-client`.

```bash
npm test power-assign phenyl-memory-client
```

## Lint and Flow
To run linting:
```bash
npm run lint
```

To run [flow](https://flow.org) (static type checker for JavaScript):
```bash
npm run flow
```

To run both:
```bash
npm run chk
```

## Run examples

Go to the directory and run `npm start`.
```bash
cd examples/<example-module-name>
npm start
```

## Compilation

```
npm run build
```

This command do two things for each module.

1. Create `dist/**/*.js` from `src/**/*.js`.
2. Create `dist/index.js.flow` from `jsnext.js` to export types.


### Build only the specified modules
Just specify the module(s) you want to build.

The following example shows how to run test in `power-filter` and `phenyl-rest-api`.

```bash
npm run build power-filter phenyl-rest-api
```


## Version bumping (Only for core committers)

```bash
npm run bump modulename1 modulename2:major modulename3:minor modulename4:patch modulename5:major ...
```

Running the command updates all the versions in `package.json` of affected phenyl modules.
No commit or publishing is made by the command, just these files are changed.

### Bumping rule
```
modulename1:major
```
Major version will be updated in modulename1: `v1.2.3` => `v2.0.0`

```
modulename1:minor
```
Minor version will be updated in modulename1: `v1.2.3` => `v1.3.0`

```
modulename1:patch
```
or just
```
modulename1
```
Patch version will be updated in modulename1: `v1.2.3` => `v1.2.4`

## Publishing to npm (Only for core commiters)

```bash
npm run publish modulename1 modulename2 ...
```

Publish `modulename1` and `modulename2` to npm.

# FAQ
## What's "/jsnext"?

We can see "/jsnext" paths at lines of importing modules like the following code.

```js
import { assign } from 'power-assign/jsnext'
```

This `jsnext.js` file is the **entrypoint** of precompiled sources.
Almost all modules contains the file.

By importing the entrypoint, we can run tests and examples precompiled sources, not the compiled `dist`.
Moreover, type information is available.

Stripping "/jsnext" is necessary at compiling phase. This is enabled by babel plugin called [transform-strip-jsnext](https://github.com/CureApp/babel-plugin-transform-strip-jsnext).
This tranform convert the line above into the following.


```js
import { assign } from 'power-assign'
```

Then, compiled sources are used in distribution.
