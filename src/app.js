const http = require('http');
const os = require('os');

/**
 * This is a simple Node.js application designed to run on EKS.
 * It displays system information to help verify load balancing 
 * and cluster connectivity.
 */

const server = http.createServer((req, res) => {
    // Collect some basic system info to show load balancing in action
    const hostname = os.hostname();
    const platform = os.platform();
    const uptime = Math.floor(os.uptime() / 60);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>EKS Production Cluster | Verified</title>
            <style>
                :root {
                    --primary: #1a73e8;
                    --bg: #f8f9fa;
                    --text: #202124;
                }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background-color: var(--bg); 
                    color: var(--text);
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                }
                .card { 
                    background: white; 
                    padding: 3rem; 
                    border-radius: 12px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05); 
                    text-align: center;
                    max-width: 500px;
                    border-top: 5px solid var(--primary);
                }
                h1 { color: var(--primary); margin-bottom: 0.5rem; }
                .status-badge {
                    background: #e6f4ea;
                    color: #1e8e3e;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    display: inline-block;
                    margin-bottom: 1rem;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-top: 2rem;
                    text-align: left;
                    font-size: 0.85rem;
                    background: #f1f3f4;
                    padding: 15px;
                    border-radius: 8px;
                }
                .label { font-weight: bold; color: #5f6368; }
                .footer { margin-top: 2rem; font-size: 0.75rem; color: #70757a; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="status-badge">Cluster Online</div>
                <h1>🚀 Welcome to EKS</h1>
                <p>Your <strong>Jenkins</strong> pipeline successfully automated the infrastructure and deployment of this application.</p>
                
                <div class="info-grid">
                    <div><span class="label">Pod Name:</span></div>
                    <div>${hostname}</div>
                    <div><span class="label">Platform:</span></div>
                    <div>${platform}</div>
                    <div><span class="label">Uptime:</span></div>
                    <div>${uptime} minutes</div>
                </div>

                <div class="footer">
                    Managed by Terraform &middot; Deployed via GitHub Actions/Jenkins
                </div>
            </div>
        </body>
        </html>
    `);
});

const PORT = 80;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Container Hostname: ${os.hostname()}`);
});
