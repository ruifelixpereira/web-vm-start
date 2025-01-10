#!/bin/bash

# load environment variables
set -a && source .env && set +a

# Required variables
required_vars=(
    "rg"
    "location"
    "subscription"
    "app_name"
    "acr_name"
    "aci_name"
    "storageaccount_name"
    "fileshare_name"
    "vnet_name"
    "vnet_prefix"
    "aci_subnet_name"
    "aci_subnet_prefix"
)

# Set the current directory to where the script lives.
cd "$(dirname "$0")"

# Function to check if all required arguments have been set
check_required_arguments() {
    # Array to store the names of the missing arguments
    local missing_arguments=()

    # Loop through the array of required argument names
    for arg_name in "${required_vars[@]}"; do
        # Check if the argument value is empty
        if [[ -z "${!arg_name}" ]]; then
            # Add the name of the missing argument to the array
            missing_arguments+=("${arg_name}")
        fi
    done

    # Check if any required argument is missing
    if [[ ${#missing_arguments[@]} -gt 0 ]]; then
        echo -e "\nError: Missing required arguments:"
        printf '  %s\n' "${missing_arguments[@]}"
        [ ! \( \( $# == 1 \) -a \( "$1" == "-c" \) \) ] && echo "  Either provide a .env file or all the arguments, but not both at the same time."
        [ ! \( $# == 22 \) ] && echo "  All arguments must be provided."
        echo ""
        exit 1
    fi
}

####################################################################################

# Check if all required arguments have been set
check_required_arguments

####################################################################################

#
# Create/Get a resource group.
#
rg_query=$(az group list --query "[?name=='$rg']")
if [ "$rg_query" == "[]" ]; then
   echo -e "\nCreating Resource group '$rg'"
   az group create --name ${rg} --location ${location}
else
   echo "Resource group $rg already exists."
fi

#
# Create ACR
#
ar_query=$(az acr list --query "[?name=='$acr_name']")
if [ "$ar_query" == "[]" ]; then
   echo -e "\nCreating Container Registry '$acr_name'"
   az acr create --resource-group $rg --name $acr_name --sku Basic
else
   echo "Container Registry $acr_name already exists."
fi

#
# Create storage account
#
sa_query=$(az storage account list --query "[?name=='$storageaccount_name']")
if [ "$sa_query" == "[]" ]; then
    echo -e "\nCreating Storage account '$storageaccount_name'"
    az storage account create \
        --name $storageaccount_name \
        --resource-group ${rg} \
        --allow-blob-public-access false \
        --allow-shared-key-access true \
        --kind StorageV2 \
        --sku Standard_LRS
else
    echo "Storage account $storageaccount_name already exists."
fi

#
# Create file share
#
fs_query=$(az storage share-rm list -g $rg --storage-account $storageaccount_name --query "[?name=='$fileshare_name']")
if [ "$fs_query" == "[]" ]; then
    echo -e "\nCreating File share '$fileshare_name'"
    az storage share-rm create \
        --resource-group $rg \
        --storage-account $storageaccount_name \
        --name $fileshare_name \
        --access-tier Hot \
        --output none
else
    echo "File share $fileshare_name already exists."
fi


#
# Create VNET
#
nt_query=$(az network vnet list -g $rg --query "[?name=='$vnet_name']")
if [ "$nt_query" == "[]" ]; then
    echo -e "\nCreating Vnet '$vnet_name'"
    az network vnet create -g $rg -n $vnet_name --address-prefix $vnet_prefix --subnet-name $aci_subnet_name --subnet-prefixes $aci_subnet_prefix
else
    echo "Vnet $vnet_name already exists."
fi

#
# Create AAD application
#
# Start by registering a Microsoft Entra application to authenticate against the API.
#
# Virtual Machine Contributor
sp_query=$(az ad sp list --filter "displayname eq '$app_name'")
if [ "$sp_query" == "[]" ]; then
    echo -e "\nCreating Service principal '$app_name'"
    APP_JSON=$(az ad sp create-for-rbac -n $app_name --role "Virtual Machine Contributor" --scopes /subscriptions/$subscription/resourceGroups/$rg --query "{appId:appId, password:password}")
    echo $APP_JSON | jq '.'

    # collect the secret and appid from the output
    #APP_ID=$(echo $APP_JSON | jq -r '.appId')
    #APP_PWD=$(echo $APP_JSON | jq -r '.password')
    APP_ID=$(az ad sp list --display-name $app_name --query "[].{appId:appId}" --output tsv)
else
    echo "Service principal $app_name already exists."
    APP_ID=$(az ad sp list --display-name $app_name --query "[].{appId:appId}" --output tsv)
fi