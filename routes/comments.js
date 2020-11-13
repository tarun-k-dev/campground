const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams is what enables us to get the value of :id out of the uri
const Campground = require('../models/campground');
const Comment = require('../models/comment');
// if we don't specify a file, just a directory, then node will default to using a file called index.js
const middleware = require('../middleware');

// =====================
// COMMENT ROUTES
// =====================

// REMEMBER: all routes have this prefix as defined in app.js: /campgrounds/:id/comments

// NEW route - show form to add comment to a campground
router.get('/new', middleware.isLoggedIn, (req, res) => {
	// find campground by slug
	Campground.findOne({ slug: req.params.slug }, (err, campground) => {
		if (err) return console.log(err);
		res.render('comments/new', { campground: campground });
	});
});

// CREATE route - add comment to a campground
router.post('/', middleware.isLoggedIn, (req, res) => {
	// lookup campground using slug
	Campground.findOne({ slug: req.params.slug }, (err, campground) => {
		if (err) return console.log('Error finding campground ', err);
		// create new comment
		Comment.create(req.body.comment, (err, comment) => {
			if (err) return console.log('error creating comment', err);
			// add username and id to comment from logged in user
			comment.author.id = req.user._id;
			comment.author.username = req.user.username;
			// save comment
			comment.save();
			// add comment to comments array for this campground
			campground.comments.push(comment);
			campground.save();
			req.flash('success', 'Successfully added comment');
			res.redirect('/campgrounds/' + req.params.slug);
		});
	});
});

// EDIT route - show comment edit page
router.get('/:comment_id/edit', middleware.isCommentAuthor, (req, res) => {
	// find id of comment to edit
	Comment.findById(req.params.comment_id, (err, comment) => {
		if (err || !comment) {
			console.log(err);
			req.flash('error', 'Sorry, there was a problem getting that comment or it may not exist');
			return res.redirect('back');
		}
		// show edit form prefilled with that comment
		res.render('comments/edit', { campground_slug: req.params.slug, comment: comment });
	});
});

// UPDATE route - update a comment
router.put('/:comment_id', middleware.isCommentAuthor, (req, res) => {
	// find and update the correct comment
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if (err || !updatedComment) return console.log(err);
		// redirect campground's show page
		req.flash('success', 'Comment updated');
		res.redirect('/campgrounds/' + req.params.slug);
	});
});

// DESTROY route - delete a comment
router.delete('/:comment_id', middleware.isCommentAuthor, (req, res) => {
	Comment.findByIdAndDelete(req.params.comment_id, (err) => {
		if (err) return console.log(err);
		req.flash('success', 'Comment removed');
		res.redirect('/campgrounds/' + req.params.slug);
	});
});

module.exports = router;
