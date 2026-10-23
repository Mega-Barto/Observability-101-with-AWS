import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, tableName } from '../lib/dynamodb.mjs';
import { logDemo } from '../lib/demo-observability.mjs';

export const putItemHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    const requestId = event.requestContext?.requestId;

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid JSON body' }),
        };
    }

    const { id, name } = body;

    logDemo({
        level: 'info',
        handler: 'putItem',
        requestId,
        path: event.path,
        id,
    });

    const params = {
        TableName: tableName,
        Item: { id, name },
    };

    try {
        await ddbDocClient.send(new PutCommand(params));
    } catch (err) {
        logDemo({
            level: 'error',
            handler: 'putItem',
            requestId,
            id,
            message: err.message,
        });
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(body),
    };

    logDemo({
        level: 'info',
        handler: 'putItem',
        requestId,
        id,
        statusCode: response.statusCode,
    });

    return response;
};
