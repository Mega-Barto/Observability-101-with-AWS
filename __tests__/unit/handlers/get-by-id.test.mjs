import { jest } from '@jest/globals';
import { getByIdHandler } from '../../../src/handlers/get-by-id.mjs';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
    DEMO_ERROR_MESSAGE,
    DEMO_LATENCY_MS,
} from '../../../src/lib/demo-observability.mjs';

describe('Test getByIdHandler', () => {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
        jest.useRealTimers();
    });

    it('should get item by id (normal scenario)', async () => {
        const item = { id: 'id1' };

        ddbMock.on(GetCommand).resolves({
            Item: item,
        });

        const event = {
            httpMethod: 'GET',
            pathParameters: {
                id: 'id1',
            },
        };

        const result = await getByIdHandler(event);

        expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify(item),
        });
    });

    it('should fail without calling DynamoDB when scenario is error', async () => {
        const event = {
            httpMethod: 'GET',
            pathParameters: { id: 'id1' },
            queryStringParameters: { scenario: 'error' },
        };

        await expect(getByIdHandler(event)).rejects.toThrow(DEMO_ERROR_MESSAGE);
        expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0);
    });

    it('should delay then get item when scenario is latency', async () => {
        jest.useFakeTimers();
        const item = { id: 'id1' };

        ddbMock.on(GetCommand).resolves({ Item: item });

        const event = {
            httpMethod: 'GET',
            pathParameters: { id: 'id1' },
            queryStringParameters: { scenario: 'latency' },
        };

        const resultPromise = getByIdHandler(event);
        await jest.advanceTimersByTimeAsync(DEMO_LATENCY_MS);
        const result = await resultPromise;

        expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify(item),
        });
        expect(ddbMock.commandCalls(GetCommand)).toHaveLength(1);
    });
});
