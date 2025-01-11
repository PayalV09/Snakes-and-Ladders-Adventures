import React, { useState, useEffect } from 'react';
import Amplify, { API, Auth, Storage } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

function App() {
    const [playerPosition, setPlayerPosition] = useState(0);
    const [playerScore, setPlayerScore] = useState(0);
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

    // Fetch game assets (e.g., background image, sounds) from S3
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const result = await API.graphql({
                    query: getAssets, // GraphQL query to fetch assets from Lambda
                });
                setAssets(result.data.getAssets.assets);
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoadingAssets(false);
            }
        };

        fetchAssets();
    }, []);

    // GraphQL query to fetch assets (you need to create this in your API)
    const getAssets = `query GetAssets {
        getAssets {
            assets
        }
    }`;

    // Handle player movement (invoke Lambda to move player)
    const movePlayer = async () => {
        try {
            const playerData = { position: playerPosition };
            const result = await API.graphql({
                query: movePlayerFunction, // GraphQL mutation for player movement
                variables: { playerData },
            });
            setPlayerPosition(result.data.movePlayer.playerPosition);
        } catch (error) {
            console.error('Error moving player:', error);
        }
    };

    // GraphQL mutation to move player (this triggers the Lambda function)
    const movePlayerFunction = `mutation MovePlayer($playerData: PlayerDataInput) {
        movePlayer(playerData: $playerData) {
            playerPosition
        }
    }`;

    // Handle saving player score to DynamoDB
    const savePlayerData = async () => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            const playerId = currentUser.username; // Use the user's username as player ID
            const result = await API.graphql({
                query: savePlayerScore, // GraphQL mutation to save score
                variables: { playerId, score: playerScore },
            });
            console.log(result.data.savePlayerScore.message);
        } catch (error) {
            console.error('Error saving player data:', error);
        }
    };

    // GraphQL mutation to save player score in DynamoDB
    const savePlayerScore = `mutation SavePlayerScore($playerId: String!, $score: Int!) {
        savePlayerScore(playerId: $playerId, score: $score) {
            message
        }
    }`;

    return (
        <div className="App">
            <h1>Snake and Ladders Game</h1>
            <div>
                <h3>Player Position: {playerPosition}</h3>
                <button onClick={movePlayer}>Move Player</button>
            </div>
            <div>
                <h3>Player Score: {playerScore}</h3>
                <button onClick={savePlayerData}>Save Score</button>
            </div>

            <div>
                <h3>Game Assets</h3>
                {loadingAssets ? (
                    <p>Loading assets...</p>
                ) : (
                    <div>
                        {assets.length > 0 ? (
                            assets.map((asset, index) => (
                                <img
                                    key={index}
                                    src={asset}
                                    alt={`Asset ${index}`}
                                    style={{ width: '100px', height: '100px' }}
                                />
                            ))
                        ) : (
                            <p>No assets found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default withAuthenticator(App); // Wraps App with authentication
