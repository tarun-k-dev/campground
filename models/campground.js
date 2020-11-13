const mongoose = require('mongoose');
const Comment = require('./comment');

// define a campground schema
const campgroundSchema = new mongoose.Schema({
	name        : {
		type     : String,
		required : 'Campground name cannot be blank.'
	},
	slug        : {
		type   : String,
		unique : true
	},
	price       : String,
	image       : String,
	description : String,
	createdAt   : { type: Date, default: Date.now },
	author      : {
		id       : {
			type : mongoose.Schema.Types.ObjectId,
			ref  : 'User'
		},
		username : String
	},
	comments    : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref  : 'Comment'
		}
	]
});

// add a slug before the campground gets saved to the database
campgroundSchema.pre('save', async function(next) {
	try {
		// check if a new campground is being saved, or if the campground name is being modified
		if (this.isNew || this.isModified('name')) {
			this.slug = await generateUniqueSlug(this._id, this.name);
		}
		next();
	} catch (err) {
		next(err);
	}
});

// Add a pre hook to delete related comments when a campground is deleted
campgroundSchema.pre('findOneAndDelete', async function() {
	let thisCampground = await this.model.findOne({
		slug : this.getFilter().slug
	});

	await Comment.deleteMany({ _id: { $in: thisCampground.comments } });
});

// export mongoose model
const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;

async function generateUniqueSlug(id, campgroundName, slug) {
	try {
		// generate the initial slug
		if (!slug) {
			slug = slugify(campgroundName);
		}
		// check if a campground with the slug already exists
		const campground = await Campground.findOne({ slug: slug });
		// if no campground was found or it is this campground, slug is unique
		if (!campground || campground._id.equals(id)) {
			return slug;
		}
		// if not unique, generate a new slug
		const newSlug = slugify(campgroundName);
		// and check again by calling this function recursively
		return await generateUniqueSlug(id, campgroundName, newSlug);
	} catch (err) {
		throw new Error(err);
	}
}

function slugify(text) {
	const slug = text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, '') // Trim - from end of text
		.substring(0, 75); // Trim at 75 characters
	return slug + '-' + Math.floor(1000 + Math.random() * 9000); // Add 4 random digits to improve uniqeness
}
