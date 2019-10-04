
// Find email function, returns object if match
const getUserByEmail = function(users, emailFromForm) {
  console.log("getuserbyemail helper made it to the function");
  for (let key in users) {
    console.log(key);
    console.log("getuserbyemail helper: ", users[key].email);
    if (users[key].email === emailFromForm) {
      return users[key];
    }
  }
  return false;
};

module.exports = { getUserByEmail };