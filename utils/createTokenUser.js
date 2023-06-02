const createTokenUser = (user) => {
  return { userID: user._id, name: user.name, role: user.role };
};

module.exports = createTokenUser;
