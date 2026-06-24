import { validationResult } from 'express-validator';
import Inquiry from '../models/Inquiry.js';

export const createInquiry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, phone, district, place, area } = req.body;
    const inquiry = await Inquiry.create({ name, email, phone, district, place, area });
    res.status(201).json({ success: true, message: 'Inquiry submitted successfully!', data: inquiry });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const { district, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (district) query.district = district;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { place: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Stats
    const stats = {
      total: await Inquiry.countDocuments(),
      new: await Inquiry.countDocuments({ status: 'new' }),
      today: await Inquiry.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      byDistrict: await Inquiry.aggregate([
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    };

    res.json({
      success: true,
      data: inquiries,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
      stats,
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
