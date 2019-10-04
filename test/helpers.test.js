const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    user_id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    user_id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return the users object if emails match', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedOutput = testUsers["userRandomID"]
    assert.equal(user, expectedOutput)
  });
  it('should return false as email is not in the db', function() {
    const user = getUserByEmail(testUsers, "fake@example.com")
    const expectedOutput = false;
    assert.equal(user, expectedOutput)
  });
});