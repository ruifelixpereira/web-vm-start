# Web App for Azure VM start self-service

This web app allows users to start Azure VMs. It is a simple Node.js app that uses the Azure SDK to interact with Azure resources.

## Setup Azure resources

You can use the provided script `scripts\create-azure-env.sh`. Copy the file `scripts\sample.env` to a new file named `scripts\.env`, customize the values for your specific Azure scenario and run it:

```bash
cd scripts
./create-azure-env.sh
```

## Run locally

If you want to test locally, you can run the app with the following commands:

```bash
cd app
node index.js
```

## Containerize

You can build a Docker image with the following command:

```bash
docker build -t web-vm-start .

docker run -p 8087:3000 web-vm-start
```


## Deployment