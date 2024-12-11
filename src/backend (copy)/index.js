// ... other imports
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});



connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to database successfully');
});

connection.on('error', (err) => {
  console.error('Database connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNRESET') {
    console.error('Connection to database was reset.');
  }
});

// ++++++++++ LOGIN ++++++++++
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT user_id, username FROM User WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length > 0) {
      res.json({ user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// ++++++++++ AUTHENTICATION ++++++++++
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Parse the simple token to get user_id (In production, use JWT)
  const userId = token.split('_')[1];
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  connection.query(
    'SELECT user_id, username FROM User WHERE user_id = ?',
    [userId],
    (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = results[0];
      next();
    }
  );
};

// ++++++++++++++++++++ GUITARS ++++++++++++++++++++

// ++++++++++ GET USERS GUITARS ++++++++++
app.get('/users/:userId/guitars', authenticateToken, (req, res) => {
  const { userId } = req.params;
  
  // Ensure users can only access their own data
  if (req.user.user_id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const query = `
    SELECT 
      g.guitar_id,
      g.brand,
      g.model,
      g.year,
      g.serial_number,
      g.genre,
      g.body_type,
      g.last_modified,
      p.photo_id,
      p.caption,
      u.user_id,
      u.username
    FROM Guitar g
    LEFT JOIN Photos p ON g.photo_id = p.photo_id
    JOIN User u ON g.user_id = u.user_id
    WHERE g.user_id = ?
    ORDER BY g.guitar_id DESC
  `;

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const guitars = results.reduce((acc, row) => {
      const guitarId = row.guitar_id;
      
if (!acc[guitarId]) {
  acc[guitarId] = {
    guitar_id: row.guitar_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    serial_number: row.serial_number,
    genre: row.genre || '',
    body_type: row.body_type || '',
    last_modified: row.last_modified,
    photos: [],
    user: {
      user_id: row.user_id,
      username: row.username
    }
  };
}

      if (row.photo_id) {
        acc[guitarId].photos.push({
          photo_id: row.photo_id,
          url: `http://localhost:5001/photos/${row.photo_id}`,
          caption: row.caption || ''
        });
      }

      return acc;
    }, {});

    res.json(Object.values(guitars));
  });
});


// ++++++++++ GET GUITARS ++++++++++
app.get('/guitars', authenticateToken, (req, res) => {

  const query = `
    SELECT 
      g.guitar_id,
      g.brand,
      g.model,
      g.year,
      g.serial_number,
      g.genre,
      g.body_type,
      g.last_modified,
      p.photo_id,
      p.caption,
      u.user_id,
      u.username
    FROM Guitar g
    LEFT JOIN Photos p ON g.photo_id = p.photo_id
    JOIN User u ON g.user_id = u.user_id
    ORDER BY g.guitar_id DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const guitars = results.reduce((acc, row) => {
      const guitarId = row.guitar_id;
      
if (!acc[guitarId]) {
  acc[guitarId] = {
    guitar_id: row.guitar_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    serial_number: row.serial_number,
    genre: row.genre || '',
    body_type: row.body_type || '',
    last_modified: row.last_modified,
    photos: [],
    user: {
      user_id: row.user_id,
      username: row.username
    }
  };
}

      if (row.photo_id) {
        acc[guitarId].photos.push({
          photo_id: row.photo_id,
          url: `http://localhost:5001/photos/${row.photo_id}`,
          caption: row.caption || ''
        });
      }

      return acc;
    }, {});

    res.json(Object.values(guitars));
  });
});

// ++++++++++ GET GUITARS BY BRAND ++++++++++
app.get('/guitars/brand/:brandName', authenticateToken, (req, res) => {
  const { brandName } = req.params;
  
  const query = `
    SELECT 
      g.guitar_id,
      g.brand,
      g.model,
      g.year,
      g.serial_number,
      g.genre,
      g.body_type,
      g.last_modified,
      p.photo_id,
      p.caption,
      u.user_id,
      u.username
    FROM Guitar g
    INNER JOIN User u ON g.user_id = u.user_id
    LEFT JOIN Photos p ON g.photo_id = p.photo_id
    WHERE g.brand = ?
    ORDER BY g.year DESC
  `;

  connection.query(query, [brandName], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const guitars = results.reduce((acc, row) => {
      const guitarId = row.guitar_id;
      
if (!acc[guitarId]) {
  acc[guitarId] = {
    guitar_id: row.guitar_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    serial_number: row.serial_number,
    genre: row.genre || '',
    body_type: row.body_type || '',
    last_modified: row.last_modified,
    photos: [],
    user: {
      user_id: row.user_id,
      username: row.username
    }
  };
}

      if (row.photo_id) {
        acc[guitarId].photos.push({
          photo_id: row.photo_id,
          url: `http://localhost:5001/photos/${row.photo_id}`,
          caption: row.caption || ''
        });
      }

      return acc;
    }, {});

    res.json(Object.values(guitars));
  });
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// ++++++++++++++++++++ INSERT A NEW GUITAR ++++++++++++++++++++
app.post('/guitars', authenticateToken, upload.single('photo'), async (req, res) => {
  const { brand, model, year, serial_number, caption, genre, body_type } = req.body;
  const photo = req.file;
  const userId = req.user.user_id;

  if (!photo) {
    return res.status(400).json({ error: 'Photo is required' });
  }

  try {
    // Insert the photo first
    const [photoResult] = await connection.promise().query(
      'INSERT INTO Photos (image_data, mime_type, caption) VALUES (?, ?, ?)',
      [photo.buffer, photo.mimetype, caption || null]
    );

    // Insert the guitar record
    const [guitarResult] = await connection.promise().query(
      'INSERT INTO Guitar (brand, model, year, serial_number, user_id, photo_id, genre, body_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, model, year, serial_number || null, userId, photoResult.insertId, genre, body_type]
    );

    res.status(201).json({
      guitar_id: guitarResult.insertId,
      brand,
      model,
      year,
      serial_number: serial_number || null,
      genre,
      body_type,
      photo_id: photoResult.insertId,
      caption: caption || '',
      user_id: userId,
      username: req.user.username
    });
  } catch (error) {
    console.error('Error creating guitar:', error);
    res.status(500).json({ error: 'Failed to create guitar' });
  }
});

// Retrieve photo data
app.get('/photos/:photoId', async (req, res) => {
  try {
    const [photo] = await connection.promise().query(
      'SELECT image_data, mime_type FROM Photos WHERE photo_id = ?',
      [req.params.photoId]
    );
    
    if (!photo[0]) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.set('Content-Type', photo[0].mime_type);
    res.send(photo[0].image_data);
  } catch (error) {
    console.error('Error retrieving photo:', error);
    res.status(500).json({ error: 'Failed to retrieve photo' });
  }
});

// ++++++++++++++++++++ UPDATE A GUITAR ++++++++++++++++++++
app.put('/guitars/:guitarId', authenticateToken, upload.single('photo'), async (req, res) => {
  const { guitarId } = req.params;
  const { brand, model, year, serial_number, caption, genre, body_type } = req.body;
  const photo = req.file;
  const userId = req.user.user_id;

  try {
    // Check if the guitar exists and belongs to the user
    const [guitarResult] = await connection.promise().query(
      'SELECT * FROM Guitar WHERE guitar_id = ? AND user_id = ?',
      [guitarId, userId]
    );

    if (guitarResult.length === 0) {
      return res.status(404).json({ error: 'Guitar not found or you do not have permission to edit it' });
    }

    // Update photo if a new one is provided
    let photoId = guitarResult[0].photo_id;
    if (photo) {
      // Insert new photo
      const [photoResult] = await connection.promise().query(
        'INSERT INTO Photos (image_data, mime_type, caption) VALUES (?, ?, ?)',
        [photo.buffer, photo.mimetype, caption || null]
      );
      photoId = photoResult.insertId;
    } else if (caption) {
      // Update caption of existing photo
      await connection.promise().query(
        'UPDATE Photos SET caption = ? WHERE photo_id = ?',
        [caption, photoId]
      );
    }

    // Update the guitar record
    await connection.promise().query(
      'UPDATE Guitar SET brand = ?, model = ?, year = ?, serial_number = ?, genre = ?, body_type = ?, photo_id = ? WHERE guitar_id = ?',
      [brand, model, year, serial_number || null, genre, body_type, photoId, guitarId]
    );

    res.json({ 
      message: 'Guitar updated successfully',
      last_modified: new Date()
    });
  } catch (error) {
    console.error('Error updating guitar:', error);
    res.status(500).json({ error: 'Failed to update guitar' });
  }
});

// ++++++++++++++++++++ DELETE A GUITAR ++++++++++++++++++++
app.delete('/guitars/:guitarId', authenticateToken, async (req, res) => {
  const { guitarId } = req.params;
  const userId = req.user.user_id;

  try {
    // Check if the guitar exists and belongs to the user
    const [guitarResult] = await connection.promise().query(
      'SELECT photo_id FROM Guitar WHERE guitar_id = ? AND user_id = ?',
      [guitarId, userId]
    );

    if (guitarResult.length === 0) {
      return res.status(404).json({ error: 'Guitar not found or you do not have permission to delete it' });
    }

    // Delete the guitar record first (due to foreign key constraint)
    await connection.promise().query(
      'DELETE FROM Guitar WHERE guitar_id = ?',
      [guitarId]
    );

    // Delete the associated photo if it exists
    if (guitarResult[0].photo_id) {
      await connection.promise().query(
        'DELETE FROM Photos WHERE photo_id = ?',
        [guitarResult[0].photo_id]
      );
    }

    res.json({ message: 'Guitar deleted successfully' });
  } catch (error) {
    console.error('Error deleting guitar:', error);
    res.status(500).json({ error: 'Failed to delete guitar' });
  }
});

// ++++++++++++++++++++ TRIGGERS/PROCEDURES/FUNCTIONS ++++++++++++++++++++

// ++++++++++ GET GUITARS BY GENRE ++++++++++
app.get('/guitars/genre/:genre', authenticateToken, (req, res) => {
  const { genre } = req.params;
  
  connection.query('CALL get_guitars_by_genre(?)', [genre], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const guitars = results[0].reduce((acc, row) => {
      const guitarId = row.guitar_id;
      
if (!acc[guitarId]) {
  acc[guitarId] = {
    guitar_id: row.guitar_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    serial_number: row.serial_number,
    genre: row.genre || '',
    body_type: row.body_type || '',
    last_modified: row.last_modified,
    photos: [],
    user: {
      user_id: row.user_id,
      username: row.username
    }
  };
}

      if (row.photo_id) {
        acc[guitarId].photos.push({
          photo_id: row.photo_id,
          url: `http://localhost:5001/photos/${row.photo_id}`,
          caption: row.caption || ''
        });
      }

      return acc;
    }, {});

    res.json(Object.values(guitars));
  });
});

// ++++++++++ GET USERS GUITAR COUNT ++++++++++
app.get('/users/:userId/guitar-count', authenticateToken, (req, res) => {
  const { userId } = req.params;
  
  // Ensure users can only access their own data
  if (req.user.user_id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const query = 'SELECT COUNT(*) AS guitar_count FROM Guitar WHERE user_id = ?';
  
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ guitar_count: results[0].guitar_count });
  });
});


// ++++++++++++++++++++ SERVER ++++++++++++++++++++
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
