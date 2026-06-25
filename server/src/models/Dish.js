const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    dishId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dishName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Shape the JSON sent to clients: expose dishId instead of Mongo's _id
dishSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Dish', dishSchema);
