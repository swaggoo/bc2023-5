const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer();

const app = express();

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static('static'));

//#region Endpoints
app.get('/notes', getNotesHandler);
app.get('/UploadForm.html', getUploadForm);
app.post('/upload', upload.single('note'), uploadNoteHandler);
app.get('/notes/:noteName', getNoteByName);
app.put('/notes/:noteName', express.json(), updateNoteByName);
app.delete('/notes/:noteName', deleteNoteByName);

app.get('/downloadNotes', (req, res) => {
  const filePath = path.join(__dirname, 'notes.json');
  res.download(filePath, 'notes.json', (err) => {
    if (err) {
      res.status(404).send('File not found!');
    }
  });
});
//#endregion

//#region Handlers
function getNotesHandler(req, res) {
  const jsonData = getJsonData();
  res.json(jsonData);
}

function getUploadForm(req, res) {
  const formPath = path.join(__dirname, 'UploadForm.html');
  res.sendFile(formPath);
}

function uploadNoteHandler(req, res) {
  const { note_name, note } = req.body;

  const existingNote = checkNoteExists(note_name);

  if (existingNote) {
    return res.status(400).send('Note with that name already exists.');
  }

  const jsonData = getJsonData();

  jsonData.push({ note_name, note });
  fs.writeFileSync('notes.json', JSON.stringify(jsonData));

  res.status(201).send(req.body);
}

function getNoteByName(req, res) {
  const noteName = req.params.noteName;
  const note = getNoteContent(noteName);

  if (!note) {
    return res.status(404).send('Note not found.');
  }

  res.send(note);
}

function updateNoteByName(req, res) {
  const noteName = req.params.noteName;
  const note = req.body;

  const jsonData = getJsonData();

  const existingNoteIndex = jsonData.findIndex(
    (item) => item.note_name === noteName
  );

  if (existingNoteIndex === -1) {
    return res.status(404).send('Note not found.');
  }

  jsonData[existingNoteIndex].note = note;
  fs.writeFileSync('notes.json', JSON.stringify(jsonData));

  res.send('Note updated successfully.');
}

function deleteNoteByName(req, res) {
  const noteName = req.params.noteName;
  const jsonData = getJsonData();

  const updatedNotes = jsonData.filter(
    (item) => item.note_name !== noteName
  );

  if (updatedNotes.length === jsonData.length) {
    return res.status(404).send('Note not found.');
  }

  fs.writeFileSync('notes.json', JSON.stringify(updatedNotes));

  res.send('Note deleted successfully.');
}
//#endregion

//#region Helpers
function checkNoteExists(noteName) {
  const jsonData = getJsonData();
  return jsonData.find((note) => note.note_name === noteName);
}

function getJsonData() {
  if (fs.existsSync('notes.json')) {
    const fileData = fs.readFileSync('notes.json', 'utf8');
    if (fileData.trim() !== '') {
      try {
        return JSON.parse(fileData);
      } catch (error) {
        console.error('Invalid JSON format in notes.json');
      }
    }
  }
  return [];
}

function getNoteContent(noteName) {
  const jsonData = getJsonData();
  const note = jsonData.find((item) => item.note_name === noteName);
  return note ? note.note : null;
}
//#endregion

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
