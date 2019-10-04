
// Find email function, returns object if match
const getUserByEmail = function(database, emailFromForm) {
  for (let key in database) {
    if (database[key].email === emailFromForm) {
      return database[key];
    }
  }
  return false;
};

module.exports = { getUserByEmail };