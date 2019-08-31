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
yarn
```

### Prepare monorepo settings
```bash
yarn bootstrap
```

After the command, all the external/interal dependencies are resolved at every module.

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

## Lint
To run linting using ESLint:

```bash
yarn lint
```

## Compilation

```
npm run build
```

This command generates `lib/**/*.js` and `lib/**/*.d.ts` from `src/**/*.ts`.
