const bcrypt = require('bcryptjs');

// Replace with actual values
const plaintextPassword = 'securepassword123';
const hashedPassword = '$2a$08$lL3aCoIYZl5diHgEOZfHKesc4K/w/k9m84wyav.kRVUDWpBTlf1bW';

bcrypt.compare(plaintextPassword, hashedPassword, (err, result) => {
  if (err) {
    console.error('Error comparing passwords:', err);
  } else {
    console.log('Password match:', result);
  }
});
