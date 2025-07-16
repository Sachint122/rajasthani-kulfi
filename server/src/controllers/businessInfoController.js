const BusinessInfo = require('../models/BusinessInfo');

exports.getBusinessInfo = async (req, res) => {
  try {
    const info = await BusinessInfo.findOne();
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBusinessInfo = async (req, res) => {
  try {
    let info = await BusinessInfo.findOne();
    if (!info) {
      info = new BusinessInfo(req.body);
    } else {
      Object.assign(info, req.body);
    }
    await info.save();
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 