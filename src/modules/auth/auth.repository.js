const User = require("./user.model");

class AuthRepository {
  async createUser(data) { 
    return await User.create(data); 
  }

  async findByEmail(email) { 
    return await User.findOne({ email }); 
  }

  async findById(id) { 
    // This is crucial for your getProfile sync logic
    return await User.findById(id); 
  }

  async update(user) {
    return await user.save();
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new AuthRepository();