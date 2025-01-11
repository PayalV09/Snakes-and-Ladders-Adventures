// aws-exports.js (Generated by Amplify CLI)
const awsconfig = {
    Auth: {
        region: 'your-region',
        userPoolId: 'your-user-pool-id',
        userPoolWebClientId: 'your-client-id',
        mandatorySignIn: true,
    },
    API: {
        endpoints: [
            {
                name: 'GameAPI',
                endpoint: 'https://your-api-endpoint.com',
                region: 'your-region',
            }
        ]
    },
    Storage: {
        bucket: 'your-bucket-name',
        region: 'your-region',
        identityPoolId: 'your-identity-pool-id',
    }
};

export default awsconfig;
