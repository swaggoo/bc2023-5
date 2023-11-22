const express = require('express');
const fs = require('fs');
const multer = require('multer');

const upload = multer();
const app = express();

const port = 8000;
const notesFilePath = 'notes.json';

try {
  const fileContent = fs.readFileSync(notesFilePath, 'utf8');
  if (fileContent.trim() === '') {
      fs.writeFileSync(notesFilePath, '[]', 'utf8');
  }
} catch (error) {
  //console.error('Помилка при роботі з файлом notes.json:', error);
}

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Сервіс запущено. Вітаємо!');
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(__dirname + '/static/UploadForm.html');
});

app.get('/notes', (req, res) => {
    try {
      const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
      res.json(notes);
    } catch (error) {
      console.error('Помилка при отриманні нотаток:', error);
      res.status(500).json([]);
    }
});

app.get('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;

    if (noteName.trim() === '') {
        alert('Будь ласка, введіть назву нотатки.');
        
    }

    const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
    const note = notes.find((n) => n.note_name === noteName);

    if (note) {
        res.send(note.note);
    } else {
        res.status(404).send('Not found'); 
    }
});

app.post('/upload', upload.none(), (req, res) => {
  const noteName = req.body.note_name;
  const noteText = req.body.note;

  // Перевірка наявності файлу notes.json
  let notes = [];
  if (fs.existsSync(notesFilePath)) {
      // Якщо файл існує, зчитуємо його вміст
      notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
  }

  if (notes.some((note) => note.note_name === noteName)) {
      res.status(400).send('Помилковий запит: Нотатка з такою назвою вже існує.');
  } else {
      const newNote = { note_name: noteName, note: noteText };
      notes.push(newNote);

      // Записуємо оновлений масив у файл notes.json
      fs.writeFileSync(notesFilePath, JSON.stringify(notes), 'utf8');
      res.status(201).send('Створено');
  }
});

app.put('/notes/:noteName',express.text(), (req, res) => {
  const noteName = req.params.noteName;
  const UpdatenoteText = req.body;

  if (noteName.trim() === '') {
   return res.status(400).send('Будь ласка, введіть назву нотатки.');
    
}
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
  const noteUpdate = notes.find((n) => n.note_name === noteName);
  if (noteUpdate) {
    noteUpdate.note = UpdatenoteText;
    fs.writeFileSync(notesFilePath, JSON.stringify(notes), 'utf8');
    res.status(200).send('OK');
  } else {
    res.status(404).send('Не знайдено');
  }
});

app.delete('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
  const noteIndex = notes.findIndex((n) => n.note_name === noteName);
  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    fs.writeFileSync(notesFilePath, JSON.stringify(notes), 'utf8');
    res.status(200).send('OK');
  } else {
    res.status(404).send('Не знайдено');
  }
});

app.listen(port, () => {
  console.log(`Сервер працює на порту ${port}`);
});