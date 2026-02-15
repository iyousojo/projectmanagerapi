const cron = require("node-cron");
const Project = require("../modules/project/project.model");
const NotificationsService = require("../modules/notifications/notification.service");

// Runs every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily deadline check...");

  const today = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(today.getDate() + 2);

  const projects = await Project.find({
    deadline: { $gte: today, $lte: twoDaysLater }
  }).populate("lead").populate("members");

  for (const project of projects) {
    await NotificationsService.deadlineReminder(project);
  }
});
