const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const tableName = 'SnakeAndLaddersLeaderboard'; // DynamoDB table name for storing player data
const s3BucketName = 'snake-and-ladders-assets'; // S3 bucket name for storing assets like images, sounds

exports.handler = async (event) => {
    const operation = event.operation; // "move" or "save"
    
    if (operation === 'move') {
        // Process the player movement
        const playerData = event.arguments.playerData; // Get player data (position, ID)
        let playerPosition = playerData.position || 0;

        // Define Snake and Ladder positions
        const snakesAndLadders = {
            3: 22,  // Ladder from 3 to 22
            5: 8,   // Ladder from 5 to 8
            11: 26, // Ladder from 11 to 26
            20: 29, // Ladder from 20 to 29
            17: 4,  // Snake from 17 to 4
            19: 7   // Snake from 19 to 7
        };

        // Apply Snake and Ladder logic
        playerPosition = snakesAndLadders[playerPosition] || playerPosition;

        // Return the updated player position
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Player moved to position ${playerPosition}`,
                playerPosition: playerPosition
            })
        };
    }

    if (operation === 'save') {
        // Save player data to DynamoDB (e.g., score, playerId)
        const playerId = event.arguments.playerId;
        const score = event.arguments.score;

        const params = {
            TableName: tableName,
            Item: {
                playerId: playerId,
                score: score,
                timestamp: new Date().toISOString(),
            }
        };

        try {
            // Save the player's score to DynamoDB
            await docClient.put(params).promise();
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Player data saved successfully!' })
            };
        } catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error saving player data', error: err })
            };
        }
    }

    if (operation === 'getAssets') {
        // Fetch game assets from S3 (e.g., background image, sounds)
        try {
            const assets = await s3.listObjectsV2({
                Bucket: s3BucketName
            }).promise();
            
            const assetUrls = assets.Contents.map(item => {
                return s3.getSignedUrl('getObject', {
                    Bucket: s3BucketName,
                    Key: item.Key,
                    Expires: 60 // URL expires in 1 minute
                });
            });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Assets fetched successfully', assets: assetUrls })
            };
        } catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error fetching assets', error: err })
            };
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid operation', error: 'Unknown operation' })
    };
};
