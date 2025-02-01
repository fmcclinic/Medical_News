export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const hasGithubToken = !!process.env.GITHUB_TOKEN;
  const hasClaudeKey = !!process.env.CLAUDE_API_KEY;

  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    env: {
      github: {
        hasToken: hasGithubToken,
        message: hasGithubToken ? 'GitHub token is configured' : 'GitHub token is not found'
      },
      claude: {
        hasKey: hasClaudeKey,
        message: hasClaudeKey ? 'Claude API key is configured' : 'Claude API key is not found'
      }
    },
    status: {
      ready: hasGithubToken && hasClaudeKey,
      message: hasGithubToken && hasClaudeKey 
        ? 'All API keys are properly configured'
        : 'Some API keys are missing'
    }
  });
}