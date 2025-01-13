
var express = require('express');
var router = express.Router();

const { startVm } = require('../controllers/vm');


// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};


router.get('/:id',
    isAuthenticated, // check if user is authenticated
    async function (req, res, next) {

        const vmId = req.params.id;
        let vmList = req.session.vmList;

        try {

            // Check if the user is member of the required security groups
            // Check if the user is member of the required security groups
            const groups = process.env.SECURITY_GROUPS.split(',') || [];
            const userGroups = req.session.account.idTokenClaims.groups || [];
            const isMember = groups.some(group => userGroups.includes(group));

            if (isMember && vmList) {
                // GET vm
                const vm = vmList.find(vm => vm.vmId === vmId);
    
                // Start VM
                await startVm(vm.subscriptionId, vm.resourceGroup, vm.name);
            }

            res.redirect('/')
        }
        catch (error) {
            console.error(error);
            //res.render('error', { error: "Error starting vm " + vmId.name });
            next(error);
        };

    }
);

module.exports = router;