import AWSXRay from 'aws-xray-sdk-core';

// Local runs and unit tests have no trace context; avoid noisy SDK errors.
AWSXRay.setContextMissingStrategy(() => {});

export const DEMO_LATENCY_MS = 2500;
export const DEMO_ERROR_MESSAGE = 'controlled demo failure';

export function resolveScenario(event) {
    const raw = event.queryStringParameters?.scenario;
    if (!raw) {
        return 'normal';
    }
    const scenario = raw.toLowerCase();
    if (scenario === 'normal' || scenario === 'error' || scenario === 'latency') {
        return scenario;
    }
    return 'normal';
}

export function logDemo(fields) {
    console.info(JSON.stringify({
        ...fields,
        timestamp: new Date().toISOString(),
    }));
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runWithSubsegment(name, fn) {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment(name);
    try {
        return await fn();
    } finally {
        subsegment?.close();
    }
}
