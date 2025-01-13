
var express = require('express');
var router = express.Router();


// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

router.get('/id',
    isAuthenticated, // check if user is authenticated
    async function (req, res, next) {
        res.render('id', { 
            idTokenClaims: req.session.account.idTokenClaims,
            isAuthenticated: req.session.isAuthenticated 
        });
    }
);


module.exports = router;