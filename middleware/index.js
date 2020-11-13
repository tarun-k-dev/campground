const Campground = require('../models/campground');
const Comment = require('../models/comment');

const middlewareObj = {};

// middleware - checks if user is logged in
middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You must be logged in to do that.');
	res.redirect('/login');
};

// middleware - checks if currently logged in user is the author of a campground
middlewareObj.isCampgroundAuthor = function(req, res, next) {
	if (req.user) {
		Campground.findOne({slug: req.params.slug}, (err, foundCampground) => {
			if (err || !foundCampground) {
				console.log(err);
				req.flash('error', 'There was a problem finding that campground');
				res.redirect('back');
			} else if (foundCampground.author.id.equals(req.user._id)) {
				return next();
			} else {
				req.flash('error', "You don't have permission to do that.");
				res.redirect('back');
			}
		});
	} else {
		req.flash('error', 'You must be logged in to do that.');
		res.redirect('/login');
	}
};

// middleware - checks if currently logged in user is the author of a campground
middlewareObj.isCommentAuthor = function(req, res, next) {
	if (req.user) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if (err || !foundComment) {
				console.log(err);
				req.flash('error', 'There was a problem finding that comment');
				res.redirect('back');
			} else if (foundComment.author.id.equals(req.user._id)) {
				return next();
			} else {
				req.flash('error', "You don't have permission to do that.");
				res.redirect('back');
			}
		});
	} else {
		req.flash('error', 'You must be logged in to do that.');
		res.redirect('/login');
	}
};

module.exports = middlewareObj;
