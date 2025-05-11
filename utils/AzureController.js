// Temporary import
import "dotenv/config.js"

import TokenManager from "./Tokenmanager.js"
import { env } from "process"

class AzureController {
	constructor () {
		this.scope = `https://management.azure.com/subscriptions/${env.SUBSCRIPTION_ID}`;
	}

	async constructRequestParams(method = "GET", body = {}) {
		const token = await TokenManager.getToken();
		const params = {};
	
		params.method = method;
		params.headers = {
			"Authorization": "Bearer " + token,
			"Content-Type": "application/json"
		};
	
		if (method != "GET") params.body = JSON.stringify(body);
	
		return params;
	}
}

export class ResourceGroupController extends AzureController {
	constructor () {
		super();
		this.scope += "/resourcegroups";
	}

	async create(rsGroupName, rsGroupLocation) {
		const endpoint = `${this.scope}/${rsGroupName}?api-version=2021-04-01`;
		const body = { location: rsGroupLocation };

		const params = await this.constructRequestParams("PUT", body);
		const res = await fetch(endpoint, params);

		if (res.status != 200 && res.status != 201) throw new Error("Resource group couldn't be created, INVALID_REQUEST");

		const data = await res.json();
		return data;
	}

	async delete(rsGroupName) {
		const endpoint = `${this.scope}/${rsGroupName}?api-version=2021-04-01`;

		const params = await this.constructRequestParams("DELETE");
		const res = await fetch(endpoint, params);

		if (res.status != 200 && res.status != 202) throw new Error("Resource group couldn't be deleted, INVALID_REQUEST");
	}

	async list() {
		const endpoint = `${this.scope}?api-version=2021-04-01`;

		const params = await this.constructRequestParams();
		const res = await fetch(endpoint, params);

		if (res.status != 200) throw new Error("Resource group couldn't be deleted, INVALID_REQUEST");

		const data = await res.json();
		return [ ...data.value ];
	}
}

export class VirtualNetworkController extends AzureController {
	constructor (resourceGroupName) {
		super();
		this.resourceGroupName = resourceGroupName;
		this.scope += `/resourcegroups/${resourceGroupName}/providers/Microsoft.Network`;
	}

	async create(vnetName, vnetLocation) {
		const endpoint = `${this.scope}/virtualNetworks/${vnetName}?api-version=2024-05-01`;
		const body = {
			location: vnetLocation,
			properties: {
				addressSpace: {
					addressPrefixes: ["10.0.0.0/16"]
				},
				subnets: [{
					name: `${vnetName}-subnet-1`,
					properties: { addressPrefix: "10.0.0.0/24" }
				}],
				flowTimeoutInMinutes: 10
			}
		};

		const params = await this.constructRequestParams("PUT", body);
		const res = await fetch(endpoint, params);

		const data = await res.json();
		return data;
	}
}

export class PublicIPController extends AzureController {
	constructor (resourceGroupName) {
		super();
		this.resourceGroupName = resourceGroupName;
		this.scope += `/resourcegroups/${resourceGroupName}/providers/Microsoft.Network/publicIPAddresses`;
	}

	async create(publicIPName, publicIPLocation) {
		const endpoint = `${this.scope}/${publicIPName}?api-version=2024-05-01`;
		const body = { location: publicIPLocation };

		const params = await this.constructRequestParams("PUT", body);
		const res = await fetch(endpoint, params);

		const data = await res.json();
		return data;
	}
}

export class NetworkSecurityGroupController extends AzureController {
	constructor (resourceGroupName) {
		super();
		this.resourceGroupName = resourceGroupName;
		this.scope += `/resourcegroups/${resourceGroupName}/providers/Microsoft.Network/networkSecurityGroups`;
	}

	createPortRules(openPorts) {
		const rules = [];

		for (let i = 0; i < openPorts.length; i++) {
			const rule = {
				properties: {
					protocol: "*",
					sourceAddressPrefix: "*",
					destinationAddressPrefix: "*",
					sourcePortRange: "*",
					destinationPortRange: `${openPorts[i]}`,
					access: "Allow",
					priority: 130 + 10 * i,
				}
			};

			const inboundRule = { ...rule, name: `rule-${i}-in` }; 
			const outboundRule = { ...rule, name: `rule-${i}-out` }; 

			inboundRule.properties = { ...rule.properties, direction: "Inbound" };
			outboundRule.properties = { ...rule.properties, direction: "Outbound" };

			rules.push(inboundRule, outboundRule);
		}

		return rules;
	}

	async create(nsgName, nsgLocation, openPorts) {
		const endpoint = `${this.scope}/${nsgName}?api-version=2024-05-01`;
		const body = {
			location: nsgLocation,
			properties: {
				securityRules: this.createPortRules(openPorts)
			}
		};

		const params = await this.constructRequestParams("PUT", body);
		const res = await fetch(endpoint, params);

		const data = await res.json();
		return data;
	}
}

export class NetworkInterfaceController extends AzureController {
	constructor (resourceGroupName) {
		super();
		this.resourceGroupName = resourceGroupName;
		this.scope += `/resourcegroups/${resourceGroupName}/providers/Microsoft.Network/networkInterfaces`;
	}

	async create(nicName, nicLocation, vnet, publicIP, nsg) {
		const endpoint = `${this.scope}/${nicName}?api-version=2024-05-01`;
		const body = {
			location: nicLocation,
			properties: {
				enableAcceleratedNetworking: true,
				disableTcpStateTracking: false,
				ipConfigurations: [{
					name: `${nicName}-ipconfig1`,
					properties: {
						publicIPAddress: { id: publicIP.id },
						subnet: { id: vnet.properties.subnets[0].id }
					}
				}],
				networkSecurityGroup: { id: nsg.id }
			}
		};
	
		const params = await this.constructRequestParams("PUT", body);
		const res = await fetch(endpoint, params);

		const data = await res.json();
		return data;
	}
}

export class VirtualMachineController extends AzureController {
	constructor (resourceGroupName) {
		super();
		this.resourceGroupName = resourceGroupName;
		this.scope += `/resourcegroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines`;
	}

	async get(vmName) {
		const endpoint = `${this.scope}/${vmName}?api-version=2024-11-01`;
		const params = this.constructRequestParams();

		const res = await fetch(endpoint, params);
		const data = await res.json()

		return data;
	}

	async dealocate(vmName) {
		const endpoint = `${this.scope}/${vmName}/deallocate?api-version=2024-11-01`;
		const params = this.constructRequestParams("POST");

		const res = await fetch(endpoint, params);

		if (res.status === 200 || res.status === 202) return true;

		return false;
	}

	async start(vmName) {
		const endpoint = `${this.scope}/${vmName}/start?api-version=2024-11-01`;
		const params = this.constructRequestParams("POST");

		const res = await fetch(endpoint, params);

		if (res.status === 200 || res.status === 202) return true;

		return false;
	}

	async create(vmName, vmLocation, vmSize) {
		const endpoint = `${this.scope}/${vmName}?api-version=2024-07-01`;

		const vnetCnt = new VirtualNetworkController(this.resourceGroupName);
		const nicCnt = new NetworkInterfaceController(this.resourceGroupName);
		const publicIPCnt = new PublicIPController(this.resourceGroupName);
		const nsgCnt = new NetworkSecurityGroupController(this.resourceGroupName);

		const vnet = await vnetCnt.create(`${vmName}-vnet`, vmLocation);
		const publicIP = await publicIPCnt.create(`${vmName}-publicIP`, vmLocation);
		const nsg = await nsgCnt.create(`${vmName}-nsg`, vmLocation, [22, 80, 25565]);

		const nic = await nicCnt.create(`${vmName}-nic`, vmLocation, vnet, publicIP, nsg);

		const body = {
			location: vmLocation,
			properties: {
				hardwareProfile: { vmSize: vmSize },
				storageProfile: {
					imageReference: {
						sku: "22.04-LTS",
						publisher: "Canonical",
						version: "latest",
						offer: "UbuntuServer"
					},
					osDisk: {
						caching: "ReadWrite",
						managedDisk: { storageAccountType: "Standard_LRS" },
						name: `${vmName}-disk`,
						createOption: "FromImage"
					}
				},
				osProfile: {
					adminUsername: "dzielska",
					adminPassword: "FortnitE123.!",
					computerName: "dzielska",
				},
				networkProfile: {
					networkInterfaces: [{
						id: nic.id,
						properties: { primary: true }
					}]
				}
			}
		};

		const params = await this.constructRequestParams("PUT", body);
		const res = await fetch(endpoint, params);

		const data = await res.json();
		data.ipAddress = publicIP.properties.ipAddress;

		return data;
	}
}