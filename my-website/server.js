const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors'); // Import CORS

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL // Use environment variable for connection string
});

// Connect to PostgreSQL
pool.connect()
  .then(() => console.log("Connected to Railway PostgreSQL"))
  .catch(err => console.error("Connection error", err.stack));

// Serve static files from the root directory
app.use(express.static('public')); // Adjust the path as necessary

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Adjust the path as necessary
});

// Endpoint to post a comment for a specific chapter
app.post('/comments/:chapter', async (req, res) => {
    const { chapter } = req.params; // Get the chapter from the URL
    const { name, content } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO comments (chapter, name, content, date) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *',
            [chapter, name, content]
        );
        res.json(result.rows[0]); // Respond with the inserted comment
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
});

// Endpoint to retrieve comments for a specific chapter
app.get('/comments/:chapter', async (req, res) => {
    const { chapter } = req.params; // Get the chapter from the URL
    try {
        const result = await pool.query('SELECT * FROM comments WHERE chapter = $1 ORDER BY date DESC', [chapter]);
        res.json(result.rows); // Respond with the comments
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
});

// Start server
const port = process.env.PORT || 3000; // Use PORT from environment or default to 3000
app.listen(port, () => console.log(`Server running on port ${port}`));
