const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

const seeds = [
	{
		name        : 'Salmon Creek',
		image       : 'https://source.unsplash.com/eDgUyGu93Yw',
		description : 'Serenity by the riverside. Listen to logging trucks whizz past from 3am till 5pm everyday!',
		author      : {
			id       : '5e80d73e82dc5f37f86e1c27',
			username : 'nat'
		}
	},
	{
		name        : 'Granite Hill',
		image       : 'https://source.unsplash.com/GZ1hc6Jvbrg',
		description : 'Who likes climbing? Make all your bleeding knuckle dreams come true with this crack filled paradise',
		author      : {
			id       : '5e80d4ba8aff140564d5f915',
			username : 'agata'
		}
	},
	{
		name        : 'Point Peak',
		image       : 'https://source.unsplash.com/AI_UTNl6HlE',
		description :
			'Great views of Point Peak from this campground. Enjoy hiking, birdwatching and relaxing in a hammock. Dogs welcome, great toilets and a bear cache.',
		author      : {
			id       : '5e80d73e82dc5f37f86e1c27',
			username : 'nat'
		}
	},
	{
		name        : 'Rocky Beach',
		image       : 'https://source.unsplash.com/2oeM4Q8T9EA',
		description :
			"A dog lovers and climbers paradise with ample dusty flat ground to pretend you're also at the beach! Who likes margaritas?!?!",
		author      : {
			id       : '5e80d4ba8aff140564d5f915',
			username : 'agata'
		}
	}
];

// purpose of this function is to start with an empty campgrouds collection and then pre-populate it with started data
async function seedDB() {
	try {
		// Remove all comments from comment collection
		await Comment.deleteMany({});
		// Remove all campgrounds from campground collection
		await Campground.deleteMany({});
		// add a few campgrounds
		for (const seed of seeds) {
			let campground = await Campground.create(seed);
			// add a few comments
			let comment = await Comment.create({
				text   : 'This place is great, but I wish I had brought more dogs.',
				author : {
					id       : '5e80d4ba8aff140564d5f915',
					username : 'agata'
				}
			});

			campground.comments.push(comment);
			campground.save();
		}
		console.log('campgrounds reseeded');
	} catch (err) {
		console.log('error: ', err);
	}
}

module.exports = seedDB;
