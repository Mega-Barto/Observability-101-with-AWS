import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, tableName } from '../lib/dynamodb.mjs';
import { logDemo } from '../lib/demo-observability.mjs';

export const getAllItemsHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    const requestId = event.requestContext?.requestId;

    logDemo({
        level: 'info',
        handler: 'getAllItems',
        requestId,
        path: event.path,
    });

    const params = {
        TableName: tableName,
    };

    let items;
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        items = data.Items;
    } catch (err) {
        logDemo({
            level: 'error',
            handler: 'getAllItems',
            requestId,
            message: err.message,
        });
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(items),
    };

    logDemo({
        level: 'info',
        handler: 'getAllItems',
        requestId,
        statusCode: response.statusCode,
        itemCount: Array.isArray(items) ? items.length : 0,
    });

    return response;
};
