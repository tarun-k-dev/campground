const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	flash = require('connect-flash'), // must be required before passport
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	methodOverride = require('method-override'),
	User = require('./models/user'),
	PORT = process.env.PORT || 5000,
	seedDB = require('./seeds');

const campgroundsRoutes = require('./routes/campgrounds'),
	commentsRoutes = require('./routes/comments'),
	indexRoutes = require('./routes/index');

// delete all campgrounds and seed with new data.
// It seems that this call should fail because it comes before
// the mongoose connect call; however, mongoose buffers all
// commands when there's no connection and then fires them off
// once established so where this code is called is not a problem.
// seedDB();

// set up mongo environment variable
// if connection is from heroku, this has been set up in the config there
// otherwise we are testing locally and we want to connect to our local db
// **remember to run mongod if running locally**
const url = process.env.DATABASEURL || 'mongodb://localhost/CG';

// MONGOOSE configuration- all these are required so mongoose runs without any errors, copied from mongoose website
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
// connect to mongo
mongoose
	// .connect('mongodb://localhost/yelpCamp')
	.connect(url)
	.then(console.log('mongoose connected'))
	.catch((err) => console.log('error connecting mongoose', err));

// APP CONFIG
app.use(bodyParser.urlencoded({ extended: true })); // enables us to get info from request object and do things like req.body.someProperty
app.set('view engine', 'ejs'); // tells express that we're using ejs templates so we don't need to add .ejs to the end of the template file references
app.use(express.static(__dirname + '/public')); // includes the public folder as the top level folder to simplify filepath specifications
app.use(methodOverride('_method')); // override default post and get routes with method-override. This tells method override to use the query method which looks for the method type as a parameter of a form action
app.use(flash()); // this is all we have to do to set up flash because we already have our session set up with express-session

// PASSPORT configuration
// Colt doesn't explain what the last two settings do, for now i'm just copy/pasting these settings to get this to work
app.use(
	require('express-session')({
		secret            : 'Khan is still the greatest', // this is a random phrase used for encryption
		resave            : false,
		saveUninitialized : false
	})
);

// tell express to use momentJS and make it available in all the views
// with the variable name: moment
app.locals.moment = require('moment');

// tell express to use passport
app.use(passport.initialize());
app.use(passport.session());
// Associate User to possport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// configure flash and variables that will be available to all routes
app.use((req, res, next) => {
	res.locals.currentUser = req.user; // tells express to pass req.user as currentUser to each route
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use(indexRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:slug/comments', commentsRoutes);

app.listen(PORT, console.log(`CampGround Server running on ${PORT}`));
