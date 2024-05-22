const Notification = require("../models/notificationModel");
const asyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const Company = require('../models/companyModel');


const getNotifications = asyncHandler(async (req, res) => {
    const isUserAdmin = req.user.role === "admin";
    const Model = isUserAdmin ? Company : User;
    const user = await Model.findById(req.user.id);

    const query = isUserAdmin ? { companyId: user._id } : { vendorId: user._id };

    try {
        const notifications = await Notification.find(query);
        if (notifications.length === 0) {
            return res.status(200).json({ message: "No notifications found" });
        }
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



const createNotification = asyncHandler(async (req, res) => {
    const { title, description, relatedObjectId, relatedObjectUrl, additionalValue, companyId, vendorId, props } = req.body;
    const isUserAdmin = req.user.role === "admin";
    const Model = isUserAdmin ? Company : User;

    const notificationData = {
        title,
        description,
        relatedObjectId,
        relatedObjectUrl,
        isRead: false,
        companyId,
        vendorId,
        props
    };

    try {
        const notification = new Notification(notificationData);
        await notification.save();

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




const markAsRead = asyncHandler(async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save()
        res.status(201).json({message : "Notification marked as read"});
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
    ;
});


const markAllAsRead = asyncHandler(async (req, res) => {
    const isUserAdmin = req.user.role === "admin";
    const Model = isUserAdmin ? Company : User;
    const user = await Model.findById(req.user.id);
  
    const query = isUserAdmin ? { companyId: user._id } : { vendorId: user._id };
  
    try {
        const result = await Notification.updateMany(
          query,
          { $set: { isRead: true } }
        );
      
        if (result.nModified === 0) {
          return res.status(200).json({ message: "No notifications found" });
        }
      
        res.status(200).json({ message: "All notifications marked as read" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  });

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead };