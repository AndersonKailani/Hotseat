const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.static('uploads'));

app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = `uploads/${filename}`;
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.status(404).send(`File not found: ${filename}`);
    } else {
      res.sendFile(filePath);
    }
  });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Ensure this line is correct

// In-memory storage for posts
let posts = [];

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Example route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Endpoint to handle image upload
app.post('/uploads', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ imageUrl: `http://localhost:${port}/uploads/${req.file.filename}` });
});


// Endpoint to get all posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// Endpoint to create a post
app.post('/api/posts', (req, res) => {
    const { text, username, image } = req.body;
    if (!text || !username) {
        return res.status(400).json({ error: 'Text and username are required' });
    }
    const post = {
        id: Date.now(),
        text,
        username,
        image,
        createdAt: new Date(),
        likes: []
    };
    posts.push(post);
    res.status(201).json(post);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
