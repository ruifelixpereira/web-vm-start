const express = require('express')
const ejs = require('ejs')
const axios = require('axios');
var _ = require('lodash');

const { DefaultAzureCredential } = require("@azure/identity");
const { ComputeManagementClient } = require("@azure/arm-compute");

require('dotenv').config();

const port = 3002;

const app = express()

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(express.json())


// Azure platform authentication
const clientId = process.env["AZURE_CLIENT_ID"];
const domain = process.env["AZURE_TENANT_ID"];
const secret = process.env["AZURE_CLIENT_SECRET"];
const subscriptionId = process.env["AZURE_SUBSCRIPTION_ID"];
const resourceGroupName = process.env["AZURE_RESOURCE_GROUP"];


if (!clientId || !domain || !secret || !subscriptionId) {
    console.log("Default credentials couldn't be found");
}
const credentials = new DefaultAzureCredential();
let vmList = new Array();

// Azure services
const computeClient = new ComputeManagementClient(credentials, subscriptionId);

/*
const listVirtualMachines = async () => {
    console.log(`Lists VMs`)
    const result = new Array();
    for await (const item of computeClient.virtualMachines.listAll()) {
        result.push(item);
    }
    return result;
};
*/

//root route method , rendering posts[] on home page
app.get('/', async (req, res) => {

    try {
        // Remove all
        while (vmList.length > 0) {
            vmList.pop();
        }

        // Get list of VMs in the default resource group
        for await (const item of computeClient.virtualMachines.list(resourceGroupName)) {
            const vm = {
                id: item.id,
                resourceGroup: item.id.split("/")[4],
                subscriptionId: item.id.split("/")[2],
                vmId: item.vmId,
                name: item.name,
                size: item.hardwareProfile.vmSize,
                powerState: ""
            }
            vmList.push(vm);
        }

        // get power state details
        let vmPromises = vmList.map(vm => computeClient.virtualMachines.instanceView(resourceGroupName, vm.name));
        let vmStates = await Promise.all(vmPromises);
        vmStates.forEach((state, index) => {
            if (state.statuses.length > 1) {
                vmList[index].powerState = state.statuses[1].displayStatus;
            }
            else {
                vmList[index].powerState = state.statuses[0].displayStatus;
            }
        });

        res.render('home', { vmList });
    }
    catch (error) {
        console.error(error);
        res.render('error', { error: "Error fetching VMs" });
    };
});

//composes post method that accepts inputs, processes it with body-parser and stores an sn object in the post array
app.get('/vm/:id', async (req, res) => {
    const vmId = req.params.id;

    try {
        // GET vm
        const vm = vmList.find(vm => vm.vmId === vmId);

        // Start VM
        await computeClient.virtualMachines.beginStart(vm.resourceGroup, vm.name);

        res.redirect('/')
    } catch (error) {
        console.error(error);
        res.render('error', { error: "Error starting vm " + vmId.name });
    }
})

// app .listen
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});