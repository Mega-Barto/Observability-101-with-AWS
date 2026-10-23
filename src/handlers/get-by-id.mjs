import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, tableName } from '../lib/dynamodb.mjs';
import {
    DEMO_ERROR_MESSAGE,
    DEMO_LATENCY_MS,
    logDemo,
    resolveScenario,
    runWithSubsegment,
    sleep,
} from '../lib/demo-observability.mjs';

/**
 * GET /{id} — demo scenarios via query param `scenario` (normal | error | latency).
 */
export const getByIdHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }

    const id = event.pathParameters?.id;
    const scenario = resolveScenario(event);
    const requestId = event.requestContext?.requestId;

    logDemo({
        level: 'info',
        handler: 'getById',
        scenario,
        id,
        requestId,
        path: event.path,
    });

    if (scenario === 'error') {
        logDemo({
            level: 'error',
            handler: 'getById',
            scenario: 'error',
            id,
            requestId,
            message: DEMO_ERROR_MESSAGE,
        });
        throw new Error(DEMO_ERROR_MESSAGE);
    }

    if (scenario === 'latency') {
        await runWithSubsegment('demo-artificial-latency', () => sleep(DEMO_LATENCY_MS));
    }

    const params = {
        TableName: tableName,
        Key: { id },
    };

    let item;
    try {
        const data = await ddbDocClient.send(new GetCommand(params));
        item = data.Item;
    } catch (err) {
        logDemo({
            level: 'error',
            handler: 'getById',
            scenario,
            id,
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
        body: JSON.stringify(item),
    };

    logDemo({
        level: 'info',
        handler: 'getById',
        scenario,
        id,
        requestId,
        statusCode: response.statusCode,
    });

    return response;
};
