class AuthHelper {
  constructor(page) {
    this.page = page;
    this._isAuthenticated = false;
  }

  isAuthenticated() {
    return this._isAuthenticated;
  }

  async login(authType = 'basic') {
    // Check if we have credentials
    const username = process.env.RGM_USERNAME;
    const password = process.env.RGM_PASSWORD;
    const tenantId = process.env.RGM_TENANT_ID;
    const clientId = process.env.RGM_CLIENT_ID;

    // Skip login if no credentials are provided
    if (!username || !password) {
      console.log('No credentials provided, testing public pages only');
      return false;
    }

    await this.page.goto('https://monitor.red-gate.com/login');
    await this.page.waitForLoadState('networkidle');

    try {
      switch (authType.toLowerCase()) {
        case 'basic':
          await this._handleBasicAuth(username, password);
          break;
        case 'ad':
          await this._handleActiveDirectoryAuth(username, password, tenantId);
          break;
        case 'oidc':
          await this._handleOpenIdAuth(clientId);
          break;
        default:
          throw new Error(`Unsupported authentication type: ${authType}`);
      }

      // Wait for successful login
      await this.page.waitForURL('https://monitor.red-gate.com/GlobalDashboard');
      this._isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      this._isAuthenticated = false;
      return false;
    }
  }

  async _handleBasicAuth(username, password) {
    const usernameInput = this.page.getByLabel('Username');
    const passwordInput = this.page.getByLabel('Password');
    const loginButton = this.page.getByRole('button', { name: 'Log in' });

    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await loginButton.click();
  }

  async _handleActiveDirectoryAuth(username, password, tenantId) {
    const adButton = this.page.getByRole('button', { name: /active directory/i });
    await adButton.click();

    // Handle Microsoft login form
    await this.page.waitForURL(/login\.microsoftonline\.com/);
    
    const emailInput = this.page.getByRole('textbox', { name: /email/i });
    await emailInput.fill(username);
    await this.page.getByRole('button', { name: 'Next' }).click();

    const passwordInput = this.page.getByRole('textbox', { name: /password/i });
    await passwordInput.fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();

    // Handle MFA if required
    const mfaPrompt = this.page.getByText(/additional verification/i);
    if (await mfaPrompt.isVisible()) {
      // Wait for manual MFA completion
      await this.page.waitForURL('https://monitor.red-gate.com/GlobalDashboard', { timeout: 120000 });
    }
  }

  async _handleOpenIdAuth(clientId) {
    const oidcButton = this.page.getByRole('button', { name: /openid connect/i });
    await oidcButton.click();

    // Handle OIDC flow - specific implementation will depend on the provider
    // This is a placeholder for the actual OIDC implementation
    console.log('OIDC auth flow needs to be implemented based on the specific provider');
  }

  async logout() {
    // Click user menu
    const userMenu = this.page.getByRole('button', { name: /user menu/i });
    await userMenu.click();

    // Click logout
    const logoutButton = this.page.getByRole('button', { name: /log out/i });
    await logoutButton.click();

    // Wait for redirect to login page
    await this.page.waitForURL('https://monitor.red-gate.com/login');
  }
}

module.exports = AuthHelper;
