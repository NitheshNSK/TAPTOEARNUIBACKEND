const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  res.status(200).json(settings);
};

exports.updateSettings = async (req, res) => {
  const update = req.body;

  const settings = await Settings.findOneAndUpdate({}, update, {
    new: true,
    upsert: true,
  });

  res.status(200).json({ message: "Settings updated", settings });
};
