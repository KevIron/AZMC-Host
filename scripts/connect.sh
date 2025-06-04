uuid=$(uuidgen)
name="api-connector-"

name="$name$uuid" 

appID="$(az ad app create --display-name $name --enable-access-token-issuance false | jq -r '.id')"
credentials="$(az ad app credential reset --id $appID | grep "")"

subscriptionID="$(az account show | jq -r '.id')"

clientID="$(jq -r '.appId' <<< "$credentials")"
tenantID="$(jq -r '.tenant' <<< "$credentials")"
secret="$(jq -r '.password' <<< "$credentials")"

servicePrincipalID="$(az ad sp create --id $clientID | jq -r '.id')"

_x="$(az role assignment create --assignee-object-id $servicePrincipalID --assignee-principal-type ServicePrincipal --role Owner --scope /subscriptions/$subscriptionID --name $servicePrincipalID | grep "")"

echo $tenantID 
echo $subscriptionID
echo $clientID 
echo $secret 