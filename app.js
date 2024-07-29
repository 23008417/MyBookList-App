const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'book_database'
});

connection.connect(err => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the database');
    }
});

app.get('/', (req, res) => {
    const sql = 'SELECT * FROM books';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving book information');
        }
        res.render('index', { books: results });
    });
});

app.get('/book/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM books WHERE id = ?';
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving book by ID');
        }
        if (results.length > 0) {
            res.render('book', { book: results[0] });
        } else {
            res.status(404).send('Book not found');
        }
    });
});

app.get('/addBook', (req, res) => {
    res.render('addBook');
});

app.post('/addBook', (req, res) => {
    const { name, image, author, publisher } = req.body;
    console.log('Received data:', { name, image, author, publisher }); // Log received data
    const sql = 'INSERT INTO books (name, image, author, publisher) VALUES (?, ?, ?, ?)';
    connection.query(sql, [name, image, author, publisher], (error, results) => {
        if (error) {
            console.error("Error adding book:", error.message);
            res.status(500).send("Error adding book");
        } else {
            res.redirect('/');
        }
    });
});

app.get('/displayBook', (req, res) => {
    const sql = 'SELECT * FROM books';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving book information');
        }
        res.render('displayBook', { books: results });
    });
});

// Existing code...

// Route to display the form for updating a book
app.get('/editBook/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM books WHERE id = ?';
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving book by ID');
        }
        if (results.length > 0) {
            res.render('editBook', { book: results[0] });
        } else {
            res.status(404).send('Book not found');
        }
    });
});

// Route to handle updating a book
app.post('/editBook/:id', (req, res) => {
    const id = req.params.id;
    const { name, image, author, publisher } = req.body;
    const sql = 'UPDATE books SET name = ?, image = ?, author = ?, publisher = ? WHERE id = ?';
    connection.query(sql, [name, image, author, publisher, id], (error, results) => {
        if (error) {
            console.error('Error updating book:', error.message);
            res.status(500).send('Error updating book');
        } else {
            res.redirect('/displayBook');
        }
    });
});

// Route to handle deleting a book
app.post('/deleteBook/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM books WHERE id = ?';
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error deleting book:', error.message);
            res.status(500).send('Error deleting book');
        } else {
            res.redirect('/displayBook');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
