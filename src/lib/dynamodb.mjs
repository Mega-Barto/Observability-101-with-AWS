import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const tracingActive = typeof process.env._X_AMZN_TRACE_ID === 'string';
const dynamoClient = tracingActive
    ? AWSXRay.captureAWSv3Client(new DynamoDBClient({}))
    : new DynamoDBClient({});

export const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
export const tableName = process.env.SAMPLE_TABLE;
