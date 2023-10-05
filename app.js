const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // path modülünü ekleyin


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

const boxes = [];




io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');


  socket.on('createRoom', (roomName) => {
    const roomID = Math.random().toString(36).substring(7); // Rastgele bir oda ID'si oluştur
    socket.join(roomID); // Kullanıcıyı odaya katılmasına izin ver
    socket.emit('roomCreated', roomID); // Oda oluşturulduğunda kullanıcıya oda ID'sini gönder
  });

  // Odaya katılma isteği işleme
  socket.on('joinRoom', (roomID) => {
    socket.join(roomID); // Kullanıcıyı odaya katılmasına izin ver
  });


  socket.on('addBox', (username) => {
    const randomValue = Math.floor(Math.random() * 100) + 1;
    const box = { username, value: randomValue, selected: false };
    boxes.push(box);
    io.emit('updateBoxes', boxes);
  });

  socket.on('selectBox', (username) => {
    const box = boxes.find((box) => box.username === username);
    if (box) {
      box.selected = true;
      io.emit('updateBoxes', boxes);
    }
  });

  socket.on('play', () => {
    const selectedBoxes = boxes.filter((box) => box.selected);
    if (selectedBoxes.length === 0) {
      return; 
    }

    selectedBoxes.sort((a, b) => a.value - b.value);
    const loser = selectedBoxes[0];
    io.emit('gameOver', loser.username);
  });

  socket.on('disconnect', () => {
    console.log('Bir kullanıcı ayrıldı');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});