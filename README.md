# WGMI NFT-Minting website

## Dependencies

- Python - ^3.9.0
- Node.js - ^16.13.0
- NPM - ^8.1.2

## Configure

### `src/js/config/`

Place the contract's ABI in `abi.js`.

Update the constants in `contract.js`.

## Run Locally

```bash
pipenv install;
npm install;
pipenv run python server.py;
```

### Build

```bash
pipenv run python build.py;
```

### Watch

Watches the `src/` dir for changes, then runs the build command.

```bash
pipenv run python watch.py;
```
