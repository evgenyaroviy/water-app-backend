import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { User } from '../db/models/User.js';
import { Water } from '../db/models/Water.js';
import { WATER_CONSTANTS, WATER_MESSAGES } from '../constants/water.js';

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

const addWater = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, date } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const waterDate = date ? new Date(date) : new Date();
    const time = waterDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    try {
      const waterRecord = await Water.create({
        userId,
        waterVolume: Number(amount),
        date: waterDate,
        time,
      });

      return res.status(201).json({
        success: true,
        data: waterRecord,
      });
    } catch (createError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid water record data',
        error: createError.message,
      });
    }
  } catch (error) {
    console.error('Error in addWater:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const updateWater = async (req, res) => {
  try {
    const { waterId } = req.params;
    const { waterVolume, time, date } = req.body;
    const userId = req.user.id;

    if (!waterId || !waterVolume || !time || !date) {
      return res.status(400).json({
        status: 400,
        message: 'Missing required fields',
        data: { waterId, waterVolume, time, date },
      });
    }

    let fullDate;
    try {
      const [hours, minutes] = time.split(':');
      fullDate = new Date(date);
      if (isNaN(fullDate.getTime())) {
        throw new Error('Invalid date format');
      }
      fullDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } catch {
      return res.status(400).json({
        status: 400,
        message: 'Invalid date or time format',
        data: 'Date should be in YYYY-MM-DD format and time in HH:mm format',
      });
    }

    const updatedWater = await Water.findOneAndUpdate(
      { _id: waterId, userId },
      { $set: { waterVolume, time, date: fullDate } },
      { new: true, runValidators: true },
    );

    if (!updatedWater) {
      return res.status(404).json({
        status: 404,
        message: 'Water record not found',
      });
    }

    res.json({
      status: 200,
      message: 'Water record updated successfully',
      data: updatedWater,
    });
  } catch (error) {
    console.error('Update water error:', error);
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: {
        error: error.message,
        name: error.name,
      },
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
    const { waterRate } = req.body;

    if (
      !waterRate ||
      waterRate < WATER_CONSTANTS.MIN_DAILY_NORM ||
      waterRate > WATER_CONSTANTS.MAX_DAILY_NORM
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid daily norm value',
        data: {
          message: WATER_MESSAGES.INVALID_DAILY_NORM,
        },
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { waterRate },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: WATER_MESSAGES.USER_NOT_FOUND,
      });
    }

    return res.json({
      status: 200,
      message: WATER_MESSAGES.UPDATE_SUCCESS,
      data: {
        waterRate: updatedUser.waterRate,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
        },
      },
    });
  } catch (error) {
    console.error('Update daily norm error:', error);
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.status === 400 ? error.message : 'Something went wrong',
      data: error.message,
    });
  }
};

const getWaterById = async (req, res) => {
  try {
    const { waterId } = req.params;
    const userId = req.user.id;

    const water = await Water.findOne({ _id: waterId, userId });

    if (!water) {
      return res.status(404).json({
        status: 404,
        message: 'Water record not found',
      });
    }

    res.json({
      status: 200,
      message: 'Water record retrieved successfully',
      data: water,
    });
  } catch (error) {
    console.error('Get water by id error:', error);
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: {
        error: error.message,
        name: error.name,
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
  getWaterById: ctrlWrapper(getWaterById),
};
