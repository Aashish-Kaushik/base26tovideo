const express = require('express');
const app = express();
const PORT = 3002;
const fs = require('fs');
const path = require('path');
const cors = require('cors');

app.use(express.json({ limit: '200mb' }));
app.use(cors());
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});
app.get('/getvideo', cors(corsOptions), async (req, res) => {
  const base64Data = req.query.data;
  console.log(req.params.data);

  // Remove URL prefrix from base64 data
  const data = base64Data.replace(/^data:video\/\w+;base64,/, '');

  // create a writeable stream to save file
  console.log();
  const writeStream = fs.createWriteStream(path.join(__dirname, '/files/output.mp4'), { encoding: 'base64' });

  // write base64 data to stream
  writeStream.write(data, 'base64');

  // close the stream and save the file
  writeStream.end();

  // donload file if it exists
  writeStream.on('finish', () => {
    console.log('file save successful');
    res.download(path.join(__dirname, '/files/output.mp4'), 'video.mp4', (err) => {
      if (err) {
        console.log('unable to download file ', err);
        res.send({ mesage: 'unable to download file' });
      } else {
        console.log('file downloaded successfully');
        fs.unlink(path.join(__dirname, '/files/output.mp4'), (unlinkerr) => {
          if (unlinkerr) {
            console.log('unable to delete file ', unlinkerr);
          } else {
            console.log('file deleted successfully');
          }
        });
      }
    });
  });
  writeStream.on('error', (err) => {
    console.log('error in saveing file ', err);
    res.status(500).send({ message: 'Error saving video file' });
  });
});

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
