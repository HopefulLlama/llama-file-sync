# llama-file-sync
llama-file-sync is a CLI tool that allows for configuration-based synchronisation of files and folders. Useful for developing cross-projects or cross-repositories. Powered by NodeJS. 

# Contents

- [Getting Started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Change Log](#change-log)
- [API Usage](#api-usage)
- [Uninstalling](#uninstalling)
- [Contribuing](#contributing)
- [License](#license)

# Getting Started
llama-file-sync is powered by NodeJS and distributed by NPM. They are distributed together and complement each other well.
Follow the installation from the NodeJS website if you do not have these installed:

[NodeJS Home](https://nodejs.org/en/)

Once NodeJS and NPM have been installed, llama-file-sync can be installed from the command line as per usual with NPM packages:

`npm install -g llama-file-sync`

# Usage
To use llama-file-sync, a configuration file is required. This is described at [Configuration](#configuration).

Usage on the command line is as follows:

`llama-file-sync <path/to/config>`

# Configuration
This file should be a NodeJS module, which must `module.exports` an object. It is described as follows:

```javascript
module.exports = {
  src: string | string[],
  dest: string,
  strategy: 'preserve' | 'oneWaySync',
  cleanDest?: boolean
}
```

`src` may be a string, or an array of strings, which are paths of files or folders to be watched. In the case of folders, every file and folder underneath the folder will be watched recursively. Any changes to these files will be synchronized to the `dest`. If paths are relative, they will be resolved from the current working directory where `llama-file-sync` is executed.

`dest` must be a single string, which is the path of a folder which will receive updates from the `src`. If paths are relative, they will be resolved from the current working directory where `llama-file-sync` is executed.

`strategy` must either be `preserve` or `oneWaySync`. This property affects how updates to watched files in `src` are propagated to `dest`.

- `preserve` reports only additions and updates to files and folders from `src` to `dest`. Any deletions will not be propagated.
- `oneWaySync` reports all changes (additions, updates and deletions) from files and folders from `src` to `dest`.

`cleanDest` is optional, and defaults to `false`. If set to `true`, the `dest` folder will be cleared of all files and folders, before starting synchronisation.

# Change Log
See the [Change Log](../master/CHANGELOG.md) document for more information on changes.

# API Usage
`llama-file-sync` can be used programmatically, as part of a NodeJS program.

See the [API Usage](../master/API.md) document for more information on changes.

# Uninstalling
To uninstall llama-file-sync, run the command:

`npm unistall -g llama-file-sync`

Upon completion of the command, llama-file-sync will be uninstalled from the machine.

# Contributing
See the [Contributing](../master/CONTRIBUTING.md) document for more information on contributing.

# License
See the [License](../master/LICENSE) document for more information on licensing.