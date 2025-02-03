import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { User } from '../db/models/User.js';
import { Water } from '../db/models/Water.js';

const getAllWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const waterRecords = await Water.find({ userId }).sort({ date: -1 });

    res.json({
      status: 200,
      message: 'Successfully retrieved water records',
      data: waterRecords,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};

const addWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { waterVolume, date } = req.body;

    const water = new Water({
      userId,
      waterVolume,
      date: date || new Date(),
    });

    await water.save();

    res.status(201).json({
      status: 201,
      message: 'Water record added successfully',
      data: water,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};

const updateWater = async (req, res) => {
  try {
    const { waterId } = req.params;
    const { waterVolume, date } = req.body;

    const water = await Water.findOneAndUpdate(
      { _id: waterId, userId: req.user.id },
      { waterVolume, date },
      { new: true },
    );

    if (!water) {
      return res.status(404).json({
        status: 404,
        message: 'Water record not found',
      });
    }

    res.json({
      status: 200,
      message: 'Water record updated successfully',
      data: water,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};

const deleteWater = async (req, res) => {
  try {
    const { waterId } = req.params;
    const water = await Water.findOneAndDelete({
      _id: waterId,
      userId: req.user.id,
    });

    if (!water) {
      return res.status(404).json({
        status: 404,
        message: 'Water record not found',
      });
    }

    res.json({
      status: 200,
      message: 'Water record deleted successfully',
      data: water,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};

const getTodayStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const waterRecords = await Water.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    });

    const user = await User.findById(userId);
    const totalWaterAmount = waterRecords.reduce(
      (sum, record) => sum + record.waterVolume,
      0,
    );
    const percentage = Math.round((totalWaterAmount / user.waterRate) * 100);

    res.json({
      status: 200,
      message: 'Today stats retrieved successfully',
      data: {
        waterRecords,
        totalWaterAmount,
        dailyNorm: user.waterRate,
        percentage,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};

const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    const [year, month] = date.split('-').map(Number);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const waterRecords = await Water.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const user = await User.findById(userId);

    const stats = waterRecords.reduce((acc, record) => {
      const day = record.date.getDate();
      if (!acc[day]) {
        acc[day] = {
          date: record.date,
          waterRecords: [],
          totalAmount: 0,
        };
      }
      acc[day].waterRecords.push(record);
      acc[day].totalAmount += record.waterVolume;
      return acc;
    }, {});

    const monthlyStats = Object.values(stats).map((dayStats) => ({
      date: dayStats.date,
      waterRecords: dayStats.waterRecords,
      totalAmount: dayStats.totalAmount,
      dailyNorm: user.waterRate,
      percentage: Math.round((dayStats.totalAmount / user.waterRate) * 100),
    }));

    res.json({
      status: 200,
      message: 'Monthly stats retrieved successfully',
      data: monthlyStats,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: error.message,
    });
  }
};

const updateDailyNorm = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dailyNormMilliliters } = req.body;

    if (
      !dailyNormMilliliters ||
      dailyNormMilliliters < 1 ||
      dailyNormMilliliters > 15000
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid daily norm value',
        data: {
          message: 'Daily norm should be between 1 and 15000 milliliters',
        },
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { waterRate: dailyNormMilliliters },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }

    return res.json({
      status: 200,
      message: 'Daily norm updated successfully',
      data: {
        dailyNormMilliliters: updatedUser.waterRate,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
        },
      },
    });
  } catch (error) {
    console.error('Update daily norm error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: {
        message: error.message,
      },
    });
  }
};

export const waterController = {
  getAllWater: ctrlWrapper(getAllWater),
  addWater: ctrlWrapper(addWater),
  updateWater: ctrlWrapper(updateWater),
  deleteWater: ctrlWrapper(deleteWater),
  getTodayStats: ctrlWrapper(getTodayStats),
  getMonthlyStats: ctrlWrapper(getMonthlyStats),
  updateDailyNorm: ctrlWrapper(updateDailyNorm),
};
