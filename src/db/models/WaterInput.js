import { model, Schema } from 'mongoose';


const waterInputSchema = new Schema(
  {
    waterVolume: {
      type: Number,
      min: 1,
      max: 5000,
      required: [true, "Enter the value of the water used"],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, "Enter the time of entering"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

waterInputSchema.post("save", (error, doc, next)=> {
error.status = 400;
next();
});

waterInputSchema.pre("findOneAndUpdate", function(next) {
    this.options.new = true,
    this.options.runValidators = true,
next();
});

waterInputSchema.post("findOneAndUpdate", (error, doc, next)=> {
  error.status = 400;
  next();
  });

  export const sortByList = ['name'];

export const WaterInput  = model('waterInput', waterInputSchema);