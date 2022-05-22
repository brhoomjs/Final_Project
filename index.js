/* eslint-disable no-bitwise */
/* eslint-disable no-console */
const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { format } = require('url');
const { Gpio } = require('onoff');
const { SerialPort, ByteLengthParser } = require('serialport');

const GPIO_LASER_PIN = 17;
const READER_USB_PATH = '/dev/ttyUSB0';

const EVENTS = {
  TAGS_LIST_UPDATE: 'TAGS_LIST_UPDATE',
};

const tagsArray = [];
let mainWindow;
let laserDevice;
let portDevice;
let mainBuffer;
let len;
let copyCount = 0;
function sendTags(tag) {
  mainWindow.webContents.send(EVENTS.TAGS_LIST_UPDATE, tag);
}
// #region READER SECTION
function toHexString(byteArray) {
  return Array.prototype.map
    .call(byteArray, (byte) => (`0${(byte & 0xff).toString(16)}`).slice(-2))
    .join('');
}
function checksum(pucY) {
  let ucCrc = 0xffff;
  for (let i = 0; i < pucY.length; i += 1) {
    ucCrc ^= pucY[i];
    for (let j = 0; j < 8; j += 1) {
      if ((ucCrc & 0x01) === 1) {
        ucCrc = (ucCrc >> 1) ^ 0x8408;
      } else {
        ucCrc >>= 1;
      }
    }
  }
  return ucCrc;
}
function verifyChecksum(dataBytes, checksumBytes) {
  const dataCrc = checksum(dataBytes);
  const crcMsb = dataCrc >> 8;
  const crcLsb = dataCrc & 0xff;
  return checksumBytes[0] === crcLsb && checksumBytes[1] === crcMsb;
}
function parseData() {
  if (!mainBuffer) throw new Error('Buffer is empty');
  if (!len) throw new Error('Len is empty');
  const B = mainBuffer;
  

  if (B.length < 5) throw new Error('Response must be at least 5 bytes');
  if (B.length > len + 1) { throw new Error('Response length is greater than buffer length'); }

  mainBuffer = undefined; // clear buffer
  copyCount = 0;
  len = 0;

  if (B.toString('hex') === '050001fbf23d') {
    console.log('EMPTY');
    return;
  }
  console.log(B.toString('hex'));
  // const addr = B.readUint8(1);
  // const cmd = B.readUint8(2);
  // const status = B.readUint8(3);
  const tagsCount = B.readUint8(4);
  const data = B.slice(5, B.length - 2);
  const checksumStatus = verifyChecksum(
    B.slice(0, B.length - 2),
    B.slice(B.length - 2, B.length),
  );
  if (!checksumStatus) throw new Error('Checksum is invalid');
  let pointer = 0;
  let i = 0;
  console.log({ tagsCount });

  while (i < tagsCount) {
    const tagLen = data[pointer];
    const tagData = data.slice(pointer + 1, tagLen + pointer + 1);
    console.log({ tagData });
    const tempTag = { id: toHexString(tagData), date: new Date() };
    const checker = tagsArray.findIndex((e) => e.id === tempTag.id) === -1;
    if (checker) {
      tagsArray.push(tempTag);
      sendTags(tempTag);
    }
    pointer += tagLen + 1;
    i += 1;
  }
}
function pushData(chunk) {
  if (!mainBuffer) {
    // eslint-disable-next-line prefer-destructuring
    len = chunk[0];
    mainBuffer = Buffer.alloc(len + 1);
    pushData(chunk);
    return;
  }
  chunk.copy(mainBuffer, copyCount);
  copyCount += chunk.length;
  if (copyCount === mainBuffer.length) {
    parseData();
  }
}
function startReading() {
  portDevice.write(new Uint8Array([4, 255, 1, 27, 180]));
}
// #endregion READER SECTION

function setup() {
  try {
    laserDevice = new Gpio(GPIO_LASER_PIN, 'in', 'falling');
  } catch (error) {
    console.log(error.message);
  }
  laserDevice.watch((err) => {
    if (err) {
      console.log(err);
      return;
    }
    startReading();
  });
  try {
    portDevice = new SerialPort({
      path: READER_USB_PATH,
      baudRate: 57600,
      autoOpen: true,
    });
  } catch (error) {
    console.log(error.message);
  }
  const parser = portDevice.pipe(new ByteLengthParser({ length: 1 }));
  parser.on('data', (data) => {
    pushData(data);
  });
}

// #region ELECTRION SECTION
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 600,
    fullscreen: true,
    backgroundColor: '#ccc',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadURL(
    format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  setup();
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
// #endregion ELECTRION SECTION
