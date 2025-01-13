const express = require('express');
const router = express.Router();

const { getVmList } = require('../controllers/vm');


router.get('/', async function (req, res, next) {
    
    let vmList = [];
    let isMember = false;
    if (req.session.isAuthenticated) {

        // Check if the user is member of the required security groups
        const groups = process.env.SECURITY_GROUPS.split(',') || [];
        const userGroups = req.session.account.idTokenClaims.groups || [];
        isMember = groups.some(group => userGroups.includes(group));

        if (!isMember) {
            message = "You are not authorized to start Azure VM in self-service. Please make sure that your user belongs to the required Security Groups.";
        }
        else {
            const vmListResponse = await getVmList(process.env["AZURE_SUBSCRIPTION_ID"], process.env["AZURE_RESOURCE_GROUP"]);
            req.session.vmList = vmListResponse;
            vmList = vmListResponse;
        }
    }

    res.render('index', {
        title: 'Azure VMs self-service',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username !== '' ? req.session.account?.username : req.session.account?.name,
        vmList: vmList,
        isAuthorized: isMember
    });

});

module.exports = router;