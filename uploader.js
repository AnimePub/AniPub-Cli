const https = require('https');
const readline = require('readline');

// Configurable values
const TARGET_URL = 'https://www.anipub.xyz/Bulk/Add';
const COOKIE_NAME = 'anipub';

// Create readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Function to generate the ARY array
function generateLinks(start, end) {
  const links = [];
  for (let i = start; i <= end; i++) {
    links.push({ link: `src=https://www.anipub.xyz/video/${i}/dub` });
  }
  return links;
}

// Main function
async function main() {
  let cookieValue = process.argv[2];
  let startId = parseInt(process.argv[3]);
  let endId = parseInt(process.argv[4]);

  // If not provided via CLI, ask interactively
  if (!cookieValue) {
    cookieValue = await askQuestion('Enter your anipub cookie value: ');
  }

  if (isNaN(startId)) {
    startId = parseInt(await askQuestion('Enter starting video ID (e.g. 2242): '));
  }

  if (isNaN(endId)) {
    endId = parseInt(await askQuestion('Enter ending video ID (e.g. 2291): '));
  }

  if (startId > endId) {
    console.log('Error: Start ID must be less than or equal to End ID');
    rl.close();
    return;
  }

  console.log(`\nGenerating links from ${startId} to ${endId}...`);
  const ARY = generateLinks(startId, endId);

  const payload = JSON.stringify({
    ID: "81",
    ARY: ARY
  });

  console.log(`Total links: ${ARY.length}`);
  console.log('Sending POST request...\n');

  const options = {
    hostname: 'www.anipub.xyz',
    path: '/Bulk/Add',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      'Cookie': `${COOKIE_NAME}=${cookieValue}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://www.anipub.xyz',
      'Referer': 'https://www.anipub.xyz/'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('Response Body:');
      console.log(data);

      if (res.statusCode === 200) {
        console.log('\nSuccess! Bulk add completed.');
      } else {
        console.log('\nRequest failed with status:', res.statusCode);
      }
      rl.close();
    });
  });

  req.on('error', (err) => {
    console.error('Request Error:', err.message);
    rl.close();
  });

  // Send the payload
  req.write(payload);
  req.end();
}

// Run the program
main();
