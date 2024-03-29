const User = require('../models/User');
const Client = require('../models/Client');
const Notification = require('../models/Notification');
const Contact = require('../models/Contact');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const stripe = require('./../utils/stripe');
const isEmptyObject = require('./../utils/isEmptyObject');
const { clientDomain } = require('../utils/constants');

exports.setMe = catchAsync(async (req, res, next) => {
  // console.log(`req.headers.origin`, req.headers.origin);
  req.params.id = req.user._id;
  next();
});

// admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  let query = User.find();
  if (req.query.role) query.find({ role: req.query.role });
  const users = await query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  // user.twitterProfile = undefined;
  // await user.save();

  await User.populate(user, { path: 'notifications', model: Notification });

  if (user.__type === 'User') {
    await User.populate(user, {
      path: 'gigs',
    });
  }

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(new AppError(`No User found against id ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // * Client.Find... returns null, find the reason
  console.log('req.body', req.body);
  const updatedUser = await Client.findByIdAndUpdate(
    req.user._id,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  console.log('updatedUser.instagramProfile', updatedUser.instagramProfile);

  if (req.body.instagramProfile) {
    updatedUser.instagramProfile = req.body.instagramProfile;
    await updatedUser.save();
  }

  if (!updatedUser)
    return next(
      new AppError(`Can't find any user with id ${req.user._id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  // * Client.Find... returns null, find the reason
  console.log('req.parmas', req.parmas);
  const updatedUser = await Client.findByIdAndUpdate(
    req.params.id,
    { isVerified: req.body.isVerified },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedUser)
    return next(
      new AppError(`Can't find any user with id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

// admin

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser)
    return next(new AppError(`No User found against id ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    user: deletedUser,
  });
});

//* CONTACT
exports.createContact = catchAsync(async (req, res, next) => {
  const { email, message, name } = req.body;

  const contact = await Contact.create({
    name,
    email,
    message,
  });

  res.status(200).json({
    status: 'success',
    contact,
  });
});

exports.getContacts = catchAsync(async (req, res, next) => {
  const contact = await Contact.find();

  res.status(200).json({
    status: 'success',
    contact,
  });
});

//* read notifications update user
exports.readNotifications = catchAsync(async (req, res, next) => {
  //* Visitors
  let updateUser = await User.findById(req.user._id);

  if (!updateUser)
    return next(new AppError(`Logged User NOT Exists in DB`, 400));

  updateUser.notifications.forEach(async (notification) => {
    await Notification.findByIdAndUpdate(notification._id, {
      isRead: true,
    });
  });

  res.status(200).json({
    status: 'success',
  });
});

exports.getAccountLink = catchAsync(async (req, res, next) => {
  const userAccount = req.user.stripeAccount;

  // * Account can be {}, we have to check its empty object
  let query;
  if (userAccount && isEmptyObject(userAccount) === true) {
    query = stripe.accounts.retrieve(userAccount);
  } else {
    query = stripe.accounts.create({
      type: 'express',
      email: req.user.email,
    });
  }

  const account = await query;

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${clientDomain}/account`,
    return_url: `${clientDomain}/account`,
    type: 'account_onboarding',
  });

  res.json({
    status: 'success',
    url: accountLink,
  });
});

exports.getDashboardLink = catchAsync(async (req, res, next) => {
  const userAccount = req.user.stripeAccount;

  // * Account can be {}, we have to check its empty object
  let query;
  if (userAccount && isEmptyObject(userAccount) === true)
    return next(
      new AppError('Connect your stripe account before viewing dashboard', 400)
    );

  const accountLink = await stripe.accounts.createLoginLink(userAccount.id);

  res.json({
    status: 'success',
    url: accountLink.url,
  });
});
