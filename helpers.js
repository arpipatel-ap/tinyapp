const express = require("express");
const bcrypt = require("bcryptjs");
const { urlDatabase, users } = require("./database");

const getUserByEmail = function(email, database) {
  if (!email) {
    return false;
  }
  for (let key in database) {
    if (database[key]["email"] === email) {
      return true;
    }
  }
  return false;
};

// Function to generate a random string for short URLs
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// Function to retrieve URLs associated with a specific user
function urlsForUser(id) {
  const userUrls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === id) {
      userUrls[urlId] = urlDatabase[urlId];
    }
  }
  console.log(userUrls);
  return userUrls;
}

module.exports = {getUserByEmail, urlsForUser, generateRandomString};