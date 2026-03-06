
const tournamentId = '6992f53f366d27f6e8d99d3a';
const categoryId = '6992f61e366d27f6e8d99d5f';
const url = `http://localhost:4010/auction/${tournamentId}/${categoryId}/status`;

console.log(`Fetching ${url}...`);

fetch(url)
    .then(res => res.text()) // Get text first to see raw body
    .then(text => {
        console.log('Raw Response:', text);
        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON Keys:', Object.keys(json));
            if (json.data) {
                console.log('json.data Keys:', Object.keys(json.data));
                // Write full JSON to file
                const fs = require('fs');
                fs.writeFileSync('debug_output.json', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('Not JSON');
        }
    })
    .catch(err => console.error('Error:', err));
