const UsersRepository = require("./users.repository");

class UsersService {
  async getProfile(userId) {
    return await UsersRepository.findById(userId);
  }

  async getFilteredStudents(status, supervisorId) {
    // 1. If supervisorId exists, fetch students assigned to that specific Admin
    if (supervisorId) {
      return await UsersRepository.getStudentsByAdmin(supervisorId, status);
    } 
    
    // 2. If status is 'unassigned', fetch students waiting for a supervisor
    if (status === "unassigned") {
      return await UsersRepository.getUnassignedStudents();
    }

    // 3. Fallback: Super-admin requesting the full list of all students
    return await UsersRepository.getStudentsByStatus(status);
  }

  async getAllAdmins() {
    // Fetches admins and includes their studentCount for the load indicators
    return await UsersRepository.getAdminsWithTheirStudents();
  }

  async authorizeStudent(studentId, supervisorId) {
    // This performs the database update: linking the two IDs
    return await UsersRepository.authorizeStudent(studentId, supervisorId);
  }

  async getSuperAdminStats() {
    // Fetching counts for the Dashboard Stats Row
    const admins = await UsersRepository.getAdminsWithTheirStudents();
    const unassignedCount = await UsersRepository.getUnassignedCount();
    
    return {
      totalAdmins: admins.length,
      unassignedStudents: unassignedCount,
      // You can add more stats here later (e.g., totalProjects)
    };
  }
}

module.exports = new UsersService();