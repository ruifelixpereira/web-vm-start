#!/bin/bash

# load environment variables
set -a && source .env && set +a

# Required variables
required_vars=(
    "rg"
    "aci_name"
    "aci_dns"
    "acr_name"
    "image_name"
    "image_version"
    "vnet_name"
    "aci_subnet_name"
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

# Get login server name
acrLoginServer=$(az acr show --name $acr_name --query loginServer --output tsv)

# Get VNET Id
VNET_ID =$(az network vnet show --resource-group $rg --name $vnet_name --query id --output tsv)

# Deploy container
az container create \
    --resource-group $rg \
    --name $aci_name \
    --image $acrLoginServer/$image_name:$image_version \
    --cpu 1 \
    --memory 1 \
    --registry-login-server $acrLoginServer \
    --registry-username <service-principal-ID> \
    --registry-password <service-principal-password> \
    --dns-name-label $aci_dns \
    --vnet $VNET_ID \
    --subnet $aci_subnet_name \
    --ports 80

# View deployment progress.
az container show --resource-group $rg --name $aci_name --query instanceView.state
