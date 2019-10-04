const users = require('./express-server.js');

// Find email function, returns object if match
const getUserByEmail = function(emailId) {
  console.log("getuserbyemail helper made it to the function");
  for (let key in users) {
    console.log(key);
    console.log("getuserbyemail helper: ", users[key].email);
    if (users[key].email === emailId) {
      return users[key];
    }
  }
  return false;
};

// getUserByEmail("x5rfdd")

module.exports = { getUserByEmail };