

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


module.exports = {getUserByEmail};