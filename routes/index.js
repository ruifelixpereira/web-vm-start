const express = require('express');
const router = express.Router();

const { getVmList } = require('../controllers/vm');


router.get('/', async function (req, res, next) {
    
    let vmList = [];
    if (req.session.isAuthenticated) {

        const vmListResponse = await getVmList(process.env["AZURE_SUBSCRIPTION_ID"], process.env["AZURE_RESOURCE_GROUP"]);
        req.session.vmList = vmListResponse;
        vmList = vmListResponse;
    }

    res.render('index', {
        title: 'Azure VMs self-service',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username !== '' ? req.session.account?.username : req.session.account?.name,
        vmList: vmList
    });

});

module.exports = router;