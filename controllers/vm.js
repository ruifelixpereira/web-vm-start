const { DefaultAzureCredential } = require("@azure/identity");
const { ComputeManagementClient } = require("@azure/arm-compute");

async function getVmList(subscriptionId, resourceGroupName) {

    try {
        const credentials = new DefaultAzureCredential();
        let vmList = new Array();
        
        // Azure services
        const computeClient = new ComputeManagementClient(credentials, subscriptionId);

        // Get list of VMs in the default resource group
        for await (const item of computeClient.virtualMachines.list(resourceGroupName)) {
            const vm = {
                id: item.id,
                resourceGroup: item.id.split("/")[4],
                subscriptionId: item.id.split("/")[2],
                vmId: item.vmId,
                name: item.name,
                size: item.hardwareProfile.vmSize,
                powerState: "",
                isStopped: false
            }
            vmList.push(vm);
        }

        // get power state details
        let vmPromises = vmList.map(vm => computeClient.virtualMachines.instanceView(resourceGroupName, vm.name));
        let vmStates = await Promise.all(vmPromises);
        vmStates.forEach((state, index) => {
            if (state.statuses.length > 1) {
                vmList[index].powerState = state.statuses[1].displayStatus;
                vmList[index].isStopped = state.statuses[1].displayStatus.toLowerCase().includes("deallocated") || state.statuses[1].displayStatus.toLowerCase().includes("stopped");
            }
            else {
                vmList[index].powerState = state.statuses[0].displayStatus;
            }
        });

        return vmList;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
}


async function startVm(subscriptionId, resourceGroupName, vmName) {

    try {
        const credentials = new DefaultAzureCredential();

        // Azure services
        const computeClient = new ComputeManagementClient(credentials, subscriptionId);

        // Start VM
        await computeClient.virtualMachines.beginStart(resourceGroupName, vmName);

        return vmName;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

module.exports = {
    getVmList,
    startVm
};