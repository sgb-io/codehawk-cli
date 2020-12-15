const fs = jest.createMockFromModule('fs');

let fileFound = false;
let readFileSyncData = null;

function __codehawkConfigFound(found, params) {
  fileFound = found;
  readFileSyncData = params
}

fs.existsSync = () => fileFound;
fs.readFileSync = () => JSON.stringify(readFileSyncData);

fs.__codehawkConfigFound = __codehawkConfigFound

module.exports = fs;
