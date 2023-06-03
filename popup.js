document.getElementById('summarizeBtn').addEventListener('click', async () => {
  console.log('Summarize button clicked...');
  const selectedText = await getSelectedText();
  console.log('Selected text:', selectedText);

  if (selectedText) {
        console.log('Calling fetchSummary...');  // Added this line
    try {
      const summary = await fetchSummary(selectedText);
      console.log('Summary:', summary);
      // Replace this with the code to display the summary in your extension
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  } else {
    console.log('No text selected.');
  }
});

async function getSelectedText() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || tabs[0].url.startsWith('chrome://')) {
        console.log('No active web page tab found.');
        resolve('');
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: () => window.getSelection().toString(),
        },
        (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error executing script:', chrome.runtime.lastError);
            resolve('');
            return;
          }

          if (!result || !Array.isArray(result) || result.length === 0) {
            console.log('No result from executeScript.');
            resolve('');
            return;
          }

          console.log('Result from executeScript:', result[0].result);
          resolve(result[0].result);
        }
      );
    });
  });
}

// Rest of your code...

async function fetchSummary(text) {
  console.log('Fetching summary for text:', text);
  const response = await fetch('https://summarizerextension-j36u7edhi-valentine896.vercel.app/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  console.log('Response:', response);

  if (!response.ok) {
    throw new Error(`Failed to fetch summary: ${response.statusText}`);
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    console.error('Error parsing response as JSON:', error);
    throw new Error('Unexpected server response');
  }

  console.log('Response data:', responseData);

  const { summary } = responseData;
  return summary;
}
