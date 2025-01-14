# Web App for Azure VM start self-service

This web app allows users to start Azure VMs in a self-service approach. It is a simple Node.js app that uses the Azure SDK to interact with Azure VM resources and it's secured with Microsoft Entra ID. Only authenticated users that belong to a well-defined and configurable set of security groups can access the application and execute operations. 

## Contents

| File/folder   | Description                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------|
| `scripts/`    | Contains Azure CLIS and bash scripts to automate Azure resources creation and app registration. |
| `app/`        | Web application sources.                                                                        |
| `docs/`       | Documentation and illustrations.                                                                |


## Setup

### Step 1. Deploy Azure resources

You can use the provided script `scripts/s01-create-azure-env.sh`. Copy the file `scripts/sample.env` to a new file named `scripts/.env`, customize the values for your specific Azure scenario and run it:

```bash
cd scripts
./s01-create-azure-env.sh
```

### Step 2. Register the app in Azure Entra ID

Register the [application](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-v2-nodejs-webapp-msal#register-the-application) in the Azure Portal > Microsoft Entra ID > App Registrations > New registration. When the Register an application page appears, enter your application's registration information:
- Enter a Name for your application, for example node-webapp. Users of your app might see this name, and you can change it later.
- Change Supported account types to Accounts in this organizational directory only.
- In the Redirect URI (optional) section, select Web in the combo box and enter the following redirect URI: http://localhost:3000/auth/redirect.
- Select Register to create the application.

On the app's Overview page, find the Application (client) ID value and record it for later. You'll need it to configure the configuration file for this project.
Under Manage, select Certificates & secrets. In the Client Secrets section, select New client secret, and then:
- Enter a key description.
- Select a key duration of In 1 year.
- Select Add.
- When the key value appears, copy it. You'll need it later.

### Step 3. Configure and build image

Copy the file `app/sample.env` to a new file named `app/.env`, customize the values for your specific Azure scenario and run the provided script:

```bash
cd scripts
./s02-prepare-image.sh
```

### Step 4. Prepare container instance configuration

Run the provided script:

```bash
cd scripts
./s03-prep-app-config.sh
```

It creates a self-signed certificate and generates 3 base64 encoded files (`base64-nginx.conf`, `base64-ssl.crt`, `base64-ssl.key`). It also outputs the ID of the ACI delegated subnet. You will use these files and values in the next step.

### Step 5. Deploy app

Copy the file `scripts/aci-template-private.yaml` (if you want to deploy an ACI app with a private endpoint) or copy the file `scripts/aci-template-public.yaml` (if you want to deploy an ACI app with a public endpoint) to a new file named `scripts/aci.yaml`, customize the following values/placeholders:

- Enter your registry name here
- Enter contents of base64-ssl.crt here
- Enter contents of base64-ssl.key here
- Enter contents of base64-nginx.conf here
- Enter your subnet id here
- Enter your registry admin password here

Run the provided script:

```bash
cd scripts
./s04-prepare-image.sh
```

After the successful deployment of your ACI, validate the IP address (for private endpoint it should be the 5th IP address of your delegated ACI subnet) and update your app registration in the Azure Portal > Microsoft Entral ID > your app > Authentication > Web Redirect URIs > Add URI and update it with https://<your-ip>/auth/redirect and save.


### Step 6. Test the app

Open your browser and navigate to the IP address of your ACI. You should see the app's main page. Click on the "Sign in" button and authenticate with your Microsoft Entra ID. If you are a member of the security group defined in the `scripts/.env` file, you should be able to see the list of VMs and start them.


## Development 

### Run locally

To test it locally, 

If you want to test locally, you can run the app with the following commands:

```bash
cd app
node server.js
```

### Containerize

You can build a Docker image and test it locally with the following command:

```bash
docker build -t web-vm-start .
docker run -d -p 3000:3000 web-vm-start
```

## References

- https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-fed-group-claims#configure-the-azure-ad-application-registration-for-group-attributes
- https://github.com/Azure-Samples/aci-in-vnet-with-sidecars
