const UsersRepository = require("./users.repository");

class UsersService {
  async getProfile(userId) {
    return await UsersRepository.findById(userId);
  }

  async getFilteredStudents(status, supervisorId) {
    // If supervisorId exists, the controller has identified the user as an 'admin'
    if (supervisorId) {
      return await UsersRepository.getStudentsByAdmin(supervisorId, status);
    } else {
      // Otherwise, it's a super-admin requesting the full list
      return await UsersRepository.getStudentsByStatus(status);
    }
  }

  async getAllAdmins() {
    return await UsersRepository.getAdminsWithTheirStudents();
  }

  async authorizeStudent(studentId, supervisorId) {
    return await UsersRepository.authorizeStudent(studentId, supervisorId);
  }

  async getSuperAdminStats() {
    const admins = await UsersRepository.getAdminsWithTheirStudents();
    return {
      totalAdmins: admins.length,
    };
  }
}

module.exports = new UsersService();