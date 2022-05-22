const { ipcRenderer } = require('electron');

const EVENTS = {
  TAGS_LIST_UPDATE: 'TAGS_LIST_UPDATE',
};
const attendanceCount = document.getElementById('attendance-count');
const attendanceGrid = document.getElementById('attendance-grid');

const mockData = [
  { name: 'Ibrahim Falah Fadhil', sn: '201610436' },
  { name: 'Mohammed Turki Fahmi', sn: '201810530' },
  { name: 'Abdul Kader Abdul Hamid', sn: '201811365' },
  { name: 'Muaad Maher Hussein', sn: '201510696' },
  { name: 'Ibrahim Falah Fadhil', sn: '201610436' },
  { name: 'Mohammed Turki Fahmi', sn: '201810530' },
  { name: 'Abdul Kader Abdul Hamid', sn: '201811365' },
  { name: 'Muaad Maher Hussein', sn: '201510696' },
  { name: 'Ibrahim Falah Fadhil', sn: '201610436' },
  { name: 'Mohammed Turki Fahmi', sn: '201810530' },
  { name: 'Abdul Kader Abdul Hamid', sn: '201811365' },
  { name: 'Muaad Maher Hussein', sn: '201510696' },
  { name: 'Ibrahim Falah Fadhil', sn: '201610436' },
  { name: 'Mohammed Turki Fahmi', sn: '201810530' },
  { name: 'Abdul Kader Abdul Hamid', sn: '201811365' },
  { name: 'Muaad Maher Hussein', sn: '201510696' },
  { name: 'Ibrahim Falah Fadhil', sn: '201610436' },
  { name: 'Mohammed Turki Fahmi', sn: '201810530' },
  { name: 'Abdul Kader Abdul Hamid', sn: '201811365' },
  { name: 'Muaad Maher Hussein', sn: '201510696' },
  { name: 'Ibrahim Falah Fadhil', sn: '201610436' },
  { name: 'Mohammed Turki Fahmi', sn: '201810530' },
  { name: 'Abdul Kader Abdul Hamid', sn: '201811365' },
  { name: 'Muaad Maher Hussein', sn: '201510696' },
];
function createAttendanceView(id = '0', time = new Date(), name = 'name', sn = '202210000') {
  const itemElement = document.createElement('div');
  const imageElement = document.createElement('img');
  imageElement.src = 'user.png';
  const nameElement = document.createElement('h4');
  nameElement.innerText = `${name} ${sn}`;
  const timeElement = document.createElement('p');
  timeElement.innerText = time.toLocaleString();
  const idElement = document.createElement('p');
  idElement.innerText = id;
  itemElement.append(imageElement, nameElement, timeElement, idElement);
  return itemElement;
}
const tagsData = [];
function init() {
  console.log("Init");
  ipcRenderer.on(EVENTS.TAGS_LIST_UPDATE, (event, tag) => {
    console.log({event, tag});
    if (tag) {
      const tempMock = mockData[tagsData.length];
      tagsData.push(tag);
      attendanceCount.innerText = tagsData.length;
      const itemElement = createAttendanceView(tag.id, tag.time, tempMock.name, tempMock.sn);
      if (tagsData.length < 1)
        attendanceGrid.append(itemElement)
      else
        attendanceGrid.insertBefore(itemElement, attendanceGrid.firstChild);
    }
  });
}
init()
