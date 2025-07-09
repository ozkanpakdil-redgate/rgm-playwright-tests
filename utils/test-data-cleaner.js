class TestDataCleaner {
  constructor(page) {
    this.page = page;
  }

  async cleanupReports() {
    await this.page.goto('https://monitor.red-gate.com/Reports');
    
    // Find and delete test reports
    const testReports = this.page.getByRole('option', { name: /test|automated/i });
    const count = await testReports.count();
    
    for (let i = 0; i < count; i++) {
      const report = testReports.nth(i);
      // Click report menu
      await report.click();
      // Click delete
      await this.page.getByRole('button', { name: 'Delete' }).click();
      // Confirm deletion
      await this.page.getByRole('button', { name: 'Confirm' }).click();
    }
  }

  async cleanupAlerts() {
    await this.page.goto('https://monitor.red-gate.com/Configuration/Alerts');
    
    // Find and delete test alert configurations
    const testAlerts = this.page.getByRole('row', { name: /test|automated/i });
    const count = await testAlerts.count();
    
    for (let i = 0; i < count; i++) {
      const alert = testAlerts.nth(i);
      // Click alert menu
      await alert.getByRole('button', { name: 'Menu' }).click();
      // Click delete
      await this.page.getByRole('button', { name: 'Delete' }).click();
      // Confirm deletion
      await this.page.getByRole('button', { name: 'Confirm' }).click();
    }
  }

  async cleanupCustomMetrics() {
    await this.page.goto('https://monitor.red-gate.com/Configuration/Custom-Metrics');
    
    // Find and delete test custom metrics
    const testMetrics = this.page.getByRole('row', { name: /test|automated/i });
    const count = await testMetrics.count();
    
    for (let i = 0; i < count; i++) {
      const metric = testMetrics.nth(i);
      // Click metric menu
      await metric.getByRole('button', { name: 'Menu' }).click();
      // Click delete
      await this.page.getByRole('button', { name: 'Delete' }).click();
      // Confirm deletion
      await this.page.getByRole('button', { name: 'Confirm' }).click();
    }
  }

  async cleanupGroups() {
    await this.page.goto('https://monitor.red-gate.com/Configuration/Groups');
    
    // Find and delete test groups
    const testGroups = this.page.getByRole('row', { name: /test|automated/i });
    const count = await testGroups.count();
    
    for (let i = 0; i < count; i++) {
      const group = testGroups.nth(i);
      // Click group menu
      await group.getByRole('button', { name: 'Menu' }).click();
      // Click delete
      await this.page.getByRole('button', { name: 'Delete' }).click();
      // Confirm deletion
      await this.page.getByRole('button', { name: 'Confirm' }).click();
    }
  }

  async cleanupAll() {
    await this.cleanupReports();
    await this.cleanupAlerts();
    await this.cleanupCustomMetrics();
    await this.cleanupGroups();
  }
}

module.exports = TestDataCleaner;
