/**
 * Test script to verify SSE event types are properly parsed (MOK-51)
 *
 * This script sends a chat message and logs all SSE events received
 * to verify that metadata, sources, token, and done events are emitted in order.
 *
 * Usage: node test-sse-events.js
 */

const API_BASE_URL = 'http://localhost:8000';
const API_VERSION = '/api/v1';

async function testSSEEventTypes() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing SSE Event Types (MOK-51)');
  console.log('='.repeat(60) + '\n');

  const request = {
    message: 'What is PNLD?',
    max_tokens: 100,
    temperature: 0.7,
  };

  console.log('Sending chat request:', request.message);
  console.log('');

  try {
    const response = await fetch(`${API_BASE_URL}${API_VERSION}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEventType = null;
    let eventCount = {
      metadata: 0,
      sources: 0,
      token: 0,
      done: 0,
      error: 0,
    };
    let eventOrder = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: false });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') {
          // Empty line marks end of an SSE message
          currentEventType = null;
          continue;
        }

        // Parse SSE format: "event: type\ndata: json\n\n"
        if (line.startsWith('event: ')) {
          // Extract event type
          currentEventType = line.substring(7).trim();
          continue;
        }

        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6);
          try {
            const data = JSON.parse(dataStr);

            // Log event type and data
            if (currentEventType === 'metadata') {
              console.log(`✓ [metadata] conversation_id: ${data.conversation_id}`);
              eventCount.metadata++;
              eventOrder.push('metadata');
            } else if (currentEventType === 'sources') {
              const sourceCount = Array.isArray(data) ? data.length : 0;
              console.log(`✓ [sources] ${sourceCount} sources received`);
              eventCount.sources++;
              eventOrder.push('sources');
              if (sourceCount > 0) {
                console.log(`  - First source: ${data[0].title}`);
              }
            } else if (currentEventType === 'token') {
              // Just log first few tokens to avoid spam
              if (eventCount.token < 3) {
                console.log(`✓ [token] "${data.content}"`);
              }
              eventCount.token++;
              if (!eventOrder.includes('token')) {
                eventOrder.push('token');
              }
            } else if (currentEventType === 'done') {
              console.log(`✓ [done] conversation_id: ${data.conversation_id}`);
              eventCount.done++;
              eventOrder.push('done');
            } else if (currentEventType === 'error') {
              console.log(`✗ [error] ${data.error}`);
              eventCount.error++;
              eventOrder.push('error');
            } else {
              console.warn('Unknown SSE event type:', currentEventType, data);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', dataStr, e);
          }
        }
      }
    }

    reader.releaseLock();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Event Summary:');
    console.log('='.repeat(60));
    console.log(`Metadata events: ${eventCount.metadata}`);
    console.log(`Sources events:  ${eventCount.sources}`);
    console.log(`Token events:    ${eventCount.token}`);
    console.log(`Done events:     ${eventCount.done}`);
    console.log(`Error events:    ${eventCount.error}`);
    console.log('');
    console.log(`Event order: ${eventOrder.join(' → ')}`);
    console.log('');

    // Validation
    const expectedOrder = ['metadata', 'sources', 'token', 'done'];
    const actualOrder = eventOrder.filter((e, i, arr) => arr.indexOf(e) === i); // Remove duplicates
    const orderMatches = JSON.stringify(expectedOrder) === JSON.stringify(actualOrder);

    if (orderMatches && eventCount.metadata > 0 && eventCount.done > 0) {
      console.log('✅ TEST PASSED: All expected events received in correct order');
    } else {
      console.log('❌ TEST FAILED: Event order or counts incorrect');
      console.log(`Expected: ${expectedOrder.join(' → ')}`);
      console.log(`Actual:   ${actualOrder.join(' → ')}`);
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('Error during test:', error.message);
    process.exit(1);
  }
}

// Run the test
testSSEEventTypes();
