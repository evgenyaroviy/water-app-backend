import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import createHttpError from 'http-errors';
import { Water } from '../db/models/WaterInput.js';
import { schemas } from '../Shemas/water.js';

const findWaterEntry = async (entryId) => {
  const record = await Water.findOne({ 'entries._id': entryId });
  if (!record) {
    throw createHttpError(404, 'Not found');
  }
  const entry = record.entries.find((e) => e._id.toString() === entryId);
  return { record, amount: entry.amount };
};

const getDayStartEnd = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const calculatePercentage = (amount, norm) => {
  return Math.floor((amount / (norm * 1000)) * 100);
};

const addWater = async (req, res) => {
  const { error } = schemas.entriesWaterSchemas.validate(req.body);
  if (error) {
    throw createHttpError(400, error.message);
  }

  const { _id: owner } = req.user;
  const { amountWater, time } = req.body;
  const { start } = getDayStartEnd();

  const todayRecord = await Water.findOne({
    owner,
    date: { $gte: start },
  });

  if (todayRecord) {
    const updated = await Water.findByIdAndUpdate(
      todayRecord._id,
      {
        $push: { entries: { amount: amountWater, time } },
        $inc: { totalAmount: amountWater },
      },
      { new: true },
    );
    return res.status(201).json(updated);
  }

  const newRecord = await Water.create({
    entries: [{ amount: amountWater, time }],
    totalAmount: amountWater,
    owner,
    date: new Date(),
  });

  res.status(201).json(newRecord);
};

const updateWater = async (req, res) => {
  const { error } = schemas.updateWaterSchemas.validate(req.body);
  if (error) {
    throw createHttpError(400, error.message);
  }

  const { entryId } = req.params;
  const { amountWater, time } = req.body;

  const { record, amount: oldAmount } = await findWaterEntry(entryId);

  const result = await Water.findByIdAndUpdate(
    record._id,
    {
      $set: {
        'entries.$[entry].amount': amountWater,
        'entries.$[entry].time': time,
      },
      $inc: { totalAmount: amountWater - oldAmount },
    },
    {
      arrayFilters: [{ 'entry._id': entryId }],
      new: true,
    },
  );

  res.json(result);
};

const deleteWater = async (req, res) => {
  const { entryId } = req.params;
  const { record, amount } = await findWaterEntry(entryId);

  const result = await Water.findByIdAndUpdate(
    record._id,
    {
      $pull: { entries: { _id: entryId } },
      $inc: { totalAmount: -amount },
    },
    { new: true },
  );

  res.json(result);
};

const getTodayStats = async (req, res) => {
  const { _id: owner } = req.user;
  const { start } = getDayStartEnd();

  const today = await Water.findOne({
    owner,
    date: { $gte: start },
  });

  if (!today) {
    return res.json({
      entries: [],
      totalWater: 0,
      percentage: 0,
    });
  }

  res.json({
    entries: today.entries,
    totalWater: today.entries.length,
    percentage: calculatePercentage(today.totalAmount, today.dailyNorm),
  });
};

const getMonthlyStats = async (req, res) => {
  const { _id: owner } = req.user;
  const { date } = req.params;
  const [year, month] = date.split('-').map(Number);

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0));

  const monthData = await Water.find({
    owner,
    date: { $gte: startDate, $lte: endDate },
  });

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const stats = monthData.map((day) => ({
    date: `${monthNames[day.date.getMonth()]}, ${day.date.getDate()}`,
    dailyNorm: day.dailyNorm,
    percentage: calculatePercentage(day.totalAmount, day.dailyNorm),
    recordsCount: day.entries.length,
  }));

  res.json(stats);
};

export const waterController = {
  addWater: ctrlWrapper(addWater),
  updateWater: ctrlWrapper(updateWater),
  deleteWater: ctrlWrapper(deleteWater),
  getTodayStats: ctrlWrapper(getTodayStats),
  getMonthlyStats: ctrlWrapper(getMonthlyStats),
};

