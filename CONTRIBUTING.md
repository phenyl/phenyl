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

Releases are published to npm via GitHub Actions using [npm Trusted Publishers (OIDC)](https://docs.npmjs.com/trusted-publishers), so no `NPM_TOKEN` is required.

### Prerequisites (one-time setup per package)
Each `@phenyl/*` package on npmjs.com must have a Trusted Publisher entry pointing to:
- Repository: `phenyl-js/phenyl`
- Workflow: `.github/workflows/publish.yml`
- Environment: _(none)_

### Cutting a release
1. From `master`, bump versions and create a git tag locally:
   ```bash
   git checkout master
   yarn build
   yarn lerna version            # bumps versions, creates tag `vX.Y.Z`, pushes commits
   ```
2. Push the tag to GitHub:
   ```bash
   git push origin vX.Y.Z
   ```
3. The `Publish` workflow runs automatically on the tag push and publishes every package
   whose `version` is not yet on the registry (`lerna publish from-package`) with provenance.

You can also trigger the workflow manually from the Actions tab; tick `dry-run` to validate
the pipeline without publishing.