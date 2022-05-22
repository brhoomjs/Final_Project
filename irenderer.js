const { ipcRenderer } = require('electron');

const EVENTS = {
  TAGS_LIST_UPDATE: 'TAGS_LIST_UPDATE',
};
const attendanceCount = document.getElementById('attendance-count');
const attendanceGrid = document.getElementById('attendance-grid');

const mockData = [
  { name: 'Ibrahim Falah Fadhil', sn: '201610436' },
];
function createAttendanceView(id = '0', time = new Date(), name = 'name', sn = '202210000') {
  const itemElement = document.createElement('div');
  const imageElement = document.createElement('img');
  imageElement.src = './img/user.png';
  const nameElement = document.createElement('h4');
  nameElement.innerText = `${name} ${sn}`;
  const timeElement = document.createElement('p');
  timeElement.innerText = time.toLocaleString();
  const idElement = document.createElement('p');
  idElement.innerText = id;
  itemElement.append(imageElement, nameElement, timeElement, idElement);
  return itemElement;
}
function init() {
  ipcRenderer.on(EVENTS.TAGS_LIST_UPDATE, (event, values) => {
    attendanceCount.innerText = values.length;
    attendanceGrid.innerHTML = '';
    values.forEach((value, index) => {
      const tempMock = mockData[index];
      const itemElement = createAttendanceView(value.id, value.time, tempMock.name, tempMock.sn);
      attendanceGrid.appendChild(itemElement);
    });
  });
}
document.addEventListener('DOMcontentLoaded', init);
