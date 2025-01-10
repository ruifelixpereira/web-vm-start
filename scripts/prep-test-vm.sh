#!/bin/bash

# load environment variables
set -a && source .env && set +a

# Required variables
required_vars=(
    "rg"
    "location"
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
# Create  VM 01
#
az vm create \
    -n test-vm-01 \
    -g $rg \
    -l $location \
    --image Ubuntu2204 \
    --size Standard_B2s \
    --storage-sku Standard_LRS \
    --generate-ssh-keys \
    --public-ip-address "" \
    --vnet-name $vnet_name \
    --vnet-address-prefix $vnet_prefix \
    --subnet $aci_subnet_name \
    --subnet-address-prefix $aci_subnet_prefix

#
# Create  VM 02
#
az vm create \
    -n test-vm-02 \
    -g $rg \
    -l $location \
    --image Ubuntu2204 \
    --size Standard_B2s \
    --storage-sku Standard_LRS \
    --generate-ssh-keys \
    --public-ip-address "" \
    --vnet-name $vnet_name \
    --vnet-address-prefix $vnet_prefix \
    --subnet $aci_subnet_name \
    --subnet-address-prefix $aci_subnet_prefix
