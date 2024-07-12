const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrls = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "a1b2c3": { longURL: "http://www.example.com", userID: "userRandomID" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null with invalid email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isNull(user);
  });
});

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const userUrls = urlsForUser("userRandomID", testUrls);
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "userRandomID" }
    };
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should return an empty object if the user has no urls', function() {
    const userUrls = urlsForUser("nonexistentUser", testUrls);
    assert.deepEqual(userUrls, {});
  });

  it('should return an empty object if there are no urls in the urlDatabase', function() {
    const userUrls = urlsForUser("userRandomID", {});
    assert.deepEqual(userUrls, {});
  });

  it('should not return urls that do not belong to the specified user', function() {
    const userUrls = urlsForUser("user2RandomID", testUrls);
    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
    };
    assert.deepEqual(userUrls, expectedOutput);
  });
});
