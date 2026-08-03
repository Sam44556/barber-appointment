import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setTesting(true);
    setResult('Testing connection...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Backend connected! Found ${data.length || 0} services`);
      } else {
        setResult(`❌ Backend responded with status: ${response.status}`);
      }
    } catch (error: any) {
      if (error.message.includes('fetch')) {
        setResult(`❌ Cannot connect to backend at ${API_BASE_URL}`);
      } else {
        setResult(`❌ Error: ${error.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg max-w-xs">
      <div className="text-sm font-medium mb-2">Backend Connection</div>
      <button
        onClick={testConnection}
        disabled={testing}
        className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs mb-2 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test Connection'}
      </button>
      {result && (
        <div className="text-xs text-muted-foreground">{result}</div>
      )}
    </div>
  );
}