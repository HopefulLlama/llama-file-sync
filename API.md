# API 

`llama-file-sync` can be used programmatically as part of a NodeJS program. This guide details how this is done, and its API.

# Contents
- [Usage](#usage)
- [API Reference](#api-reference)

# Usage
To begin install `llama-file-sync` locally, as per usual with npm packages:

`npm install --save llama-file-sync`

This may then be `require` as usual:

```javascript
const llamaFileSync = require('llama-file-sync');
```

# API Reference
## `llamaFileSync.run(pathToConfig, callback)`

Executes llama-file-sync.

| Parameter | Data Type | Description |
|---|---|---|
| pathToConfig | String | The path to the configuration file. If this is a relative path, it will be resolved from the current working directory where the program is executed. |
| callback | Function | The callback function to be called when llama-file-sync has completed setting up its watchers |

### `callback(error, watchers)`

The callback function executed by [llamaFileSync.run(pathToConfig, callback)](#llamaFileSync.run(pathToConfig, callback)).

| Parameter | Data Type | Description |
|---|---|---|
| error | String &#124; undefined | An error received from llama-file-sync. Will be `undefined` if llama-file-sync ran successfully  |
| watchers | chokidar[] | An array of chokidar watchers. More information about [chokidar](https://github.com/paulmillr/chokidar) |