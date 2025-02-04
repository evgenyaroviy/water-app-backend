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
    const { waterVolume, time, date } = req.body;

    const [hours, minutes] = time.split(':');
    const fullDate = new Date(date);
    fullDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const water = new Water({
      userId,
      waterVolume,
      time,
      date: fullDate,
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
    const { waterVolume, time, date } = req.body;

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
    } catch (parseError) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid date or time format',
        data: 'Date should be in YYYY-MM-DD format and time in HH:mm format',
      });
    }

    const updatedWater = await Water.findOneAndUpdate(
      { _id: waterId, userId: req.user.id },
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
