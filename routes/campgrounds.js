const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
// if we don't specify a file, just a directory, then node will default to using a file called index.js - whichis what's happening where we require express
const middleware = require('../middleware');

// =================
// CAMPGROUND Routes

// INDEX route - show all the campgrounds
router.get('/', (req, res) => {
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// find campgrounds that match the search term
		Campground.find({ name: regex }, (err, searchResults) => {
			if (err) {
				console.log('error in GET campgrounds', err);
			} else {
				if (searchResults.length < 1) {
					req.flash('error', 'No campgrounds match that search');
					return res.redirect('/campgrounds');
				}
				// show all the campgrounds on a page
				res.render('campgrounds/index', { campgrounds: searchResults });
			}
		});
	} else {
		// get all campgrounds from DB
		Campground.find({}, (err, allCampgrounds) => {
			if (err) {
				console.log('error in GET campgrounds', err);
			} else {
				// show all the campgrounds on a page
				res.render('campgrounds/index', { campgrounds: allCampgrounds });
			}
		});
	}
});

// NEW route - show form to create new campground
router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

// CREATE route - add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
	// get data from form and add to campgrounds collection
	const name = req.body.name;
	const price = req.body.price;
	const image = req.body.image;
	const description = req.body.description;
	const author = {
		id       : req.user._id,
		username : req.user.username
	};
	const newCampground = {
		name        : name,
		price       : price,
		image       : image,
		description : description,
		author      : author
	};
	// create a new campground and save to DB
	Campground.create(newCampground, (err, newlyCreated) => {
		if (err) {
			console.log(err);
		} else {
			// redirect back to campgrounds
			res.redirect('/campgrounds');
		}
	});
});

// SHOW route - show info about one campground
// it's very important that this route, which will match anything following '/campgrounds' comes after '/campgrounds/new', otherwise, we'll never get to 'new'
router.get('/:slug', (req, res) => {
	// find the campground with provided id
	Campground.findOne({slug: req.params.slug}).populate('comments').exec((err, foundCampground) => {
		if (err || !foundCampground) {
			console.log(err);
			req.flash('error', 'Sorry, there was a problem getting that campground or it may not exist');
			return res.redirect('/campgrounds');
		} else {
			// render show template with that campground
			res.render('campgrounds/show', { campground: foundCampground });
		}
	});
});

// EDIT route
router.get('/:slug/edit', middleware.isCampgroundAuthor, (req, res) => {
	Campground.findOne({slug: req.params.slug}, (err, foundCampground) => {
		if (err || !foundCampground) {
			req.flash('error', 'Sorry, there was a problem getting that campground or it may not exist');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

// UPDATE route
router.put('/:slug', middleware.isCampgroundAuthor, (req, res) => {
	// find and update the correct campground
	Campground.findOne({slug: req.params.slug}, (err, campground) => {
		if (err || !campground) return console.log(err);
		// redirect campground's show page
		campground.name = req.body.campground.name;
		campground.price = req.body.campground.price;
		campground.description = req.body.campground.description;
		campground.image = req.body.campground.image;
		campground.save(function(err, savedCAmpground) {
			if (err) {
				console.log(err);
				req.flash('error', err.message);
				res.redirect('back');
			} else {

				res.redirect('/campgrounds/' + savedCAmpground.slug);
			}
		});
	});
});

// DESTROY route
router.delete('/:slug', middleware.isCampgroundAuthor, (req, res) => {
	Campground.findOneAndDelete({slug: req.params.slug}, (err) => {
		if (err) return console.log(err);
		res.redirect('/campgrounds');
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
