# Contributing
Why don't you make Phenyl better with your issue reports and pull requests? We're open to any contributions.

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

### Setting up Node.js version management with asdf
We highly recommend you to use [asdf](https://asdf-vm.com/) to manage node versions.
To install asdf, please refer to the [asdf installation guide](https://asdf-vm.com/guide/getting-started.html).

After installing asdf, please install the following plugins.
```bash
asdf plugin-add nodejs
asdf plugin-add yarn
asdf install
```

> [!NOTE]
> If you cannot install asdf to your environment, please ensure you use the same versions specified in `.tool-versions`.

### Install the dependencies
```bash
cd phenyl
yarn
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
brew tap mongodb/brew
brew install mongodb-community
```

## Lint
To run linting using ESLint:

```bash
yarn lint
```

## Compilation

```
yarn build
```

This command generates `lib/**/*.js` and `lib/**/*.d.ts` from `src/**/*.ts`.

## Release

**Must be a member of the npm organization's `phenyl-release-members` team.**

```
npm whoami # Print your npm account that has already joined organization
git checkout master
yarn build
yarn run publish
```