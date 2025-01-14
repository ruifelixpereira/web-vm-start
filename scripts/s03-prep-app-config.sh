#!/bin/bash

# load environment variables
set -a && source .env && set +a

# Required variables
required_vars=(
    "aci_dns"
    "rg"
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

#
# Create a self-signed certificate
#
openssl req -x509 -newkey rsa:4096 -nodes -out ssl.crt -keyout ssl.key -days 365 -subj "/C=PT/L=Lisbon/O=Contoso/OU=IT/CN=$aci_dns"

# Base64-encode secrets and configuration file and output in a single line
cat nginx.conf | base64 -w 0 > base64-nginx.conf
cat ssl.crt | base64 -w 0 > base64-ssl.crt
cat ssl.key | base64 -w 0 > base64-ssl.key

echo "Secrets and configuration files have been base64-encoded and saved in the following files: base64-nginx.conf, base64-ssl.crt, base64-ssl.key"

#
# Get SUBNET Id
#
SUBNET_ID=$(az network vnet subnet show -g $rg -n $aci_subnet_name --vnet-name $vnet_name --query id --output tsv)
echo SUBNET_ID: $SUBNET_ID
