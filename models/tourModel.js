const mongoose = require('mongoose')
const slugify = require('slugify')

const tourSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
      },
      slug: String,
      duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
      },
      maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
      },
      difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
          values: ['easy', 'medium', 'difficult'], // this validator is available only on strings, difficulty must be string and only one of those
          message: 'Difficulty is either: easy, medium, difficult'
        }
      },
      ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'], //these 2 validators also work on dates
        max: [5, 'Rating must be below 5.0'] //these 2 validators also work on dates
      },
      ratingsQuantity: {
        type: Number,
        default: 0
      },
      price: {
        type: Number,
        required: [true, 'A tour must have a price']
      },
      priceDiscount: {
        type: Number,
        validate: {
          validator: function(val) {
            // this only points to current doc on NEW document creation!!!
            return val < this.price
          },
          message: 'Discount price ({VALUE}) should be below regular price'
        }
      },
      summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
      },
      description: {
        type: String,
        trim: true
      },
      imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
      },
      images: [String],
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false
      },
      startDates: [Date],
      secretTour: {
        type: Boolean,
        default: false
      }
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  )


// Document middlewares, runs before .save() and .create() ONLY!
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7
})

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }) // this points to currently saved document
  next()
})

tourSchema.post('save', function (doc,next) {
  // no more this keyword, but we always have doc
  next()
})

// Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({secretTour: { $ne: true }})
  next()
})

tourSchema.post(/^find/, function (doc,next) {
  // works same as above post 'save' document middleware
  next()
})

// Aggregation middleware
tourSchema.pre('aggregate', function (next) { // also has post
  // this.pipeline()[0].$match.secretTour = { $ne: true }
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  next()
})

const Tour = mongoose.model('Tour', tourSchema) // capital letters are convention

module.exports = Tour
