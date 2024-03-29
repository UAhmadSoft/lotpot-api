const Notification = require('../models/Notification');
const User = require('../models/User');

const sendNotificationEvent = async ({
  title,
  description,
  type,
  isVisitor,
  link,
  userId,
  ...rest
}) => {
  const { io } = require('../../server');
  //* send notification to user
  const notification = await Notification.create({
    title,
    description,
    type,
    isVisitor,
    link,
  });

  // * Push Notification to user (if userId)

  if (userId) {
    const updatedUser = await User.findById(userId);
    if (!updatedUser) return;
    updatedUser.notifications = [notification, ...updatedUser.notifications];
    await updatedUser.save();
  }

  //* notification sent to admin side
  io.sockets.emit('newNotification', {
    newNotification: notification,
    userId,
    ...rest,
  });
};

module.exports = sendNotificationEvent;
