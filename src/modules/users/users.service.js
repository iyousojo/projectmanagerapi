const UsersRepository = require("./users.repository");

class UsersService {
  async getProfile(userId) {
    return await UsersRepository.findById(userId);
  }

  async getFilteredStudents(status, supervisorId) {
    // If an admin is logged in, they provide a supervisorId
    if (supervisorId) {
      return await UsersRepository.getStudentsByAdmin(supervisorId);
    } 
    
    // If super-admin is looking for unassigned students
    if (status === "unassigned") {
      return await UsersRepository.getUnassignedStudents();
    }

    return await UsersRepository.getStudentsByStatus(status);
  }

  async getAllAdmins() {
    return await UsersRepository.getAdminsWithTheirStudents();
  }

  async authorizeStudent(studentId, supervisorId) {
    return await UsersRepository.authorizeStudent(studentId, supervisorId);
  }

  async getSuperAdminStats() {
    const admins = await UsersRepository.getAdminsWithTheirStudents();
    const unassigned = await UsersRepository.getUnassignedStudents();
    
    return {
      totalAdmins: admins.length,
      unassignedStudents: unassigned.length,
    };
  }
}

module.exports = new UsersService();