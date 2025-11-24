from playwright.sync_api import Page, expect, sync_playwright

def verify_dashboard_features(page: Page):
    # 1. Navigate to Dashboard (Should bypass Login due to mock)
    print("Navigating to Dashboard...")
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_load_state("networkidle")

    # Verify Dashboard Elements
    expect(page.get_by_text("Registered Developers")).to_be_visible()
    expect(page.get_by_text("Growth Evolution")).to_be_visible()
    page.screenshot(path="verification/dashboard.png")
    print("Dashboard verified.")

    # 2. Navigate to Subscriptions
    print("Navigating to Subscriptions...")
    page.get_by_role("button", name="Subscriptions").click()
    page.wait_for_load_state("networkidle")

    expect(page.get_by_role("heading", name="Subscriptions")).to_be_visible()
    expect(page.get_by_text("Add Subscription")).to_be_visible()

    # Test Add Subscription Modal
    page.get_by_role("button", name="Add Subscription").click()
    expect(page.get_by_text("New Subscription")).to_be_visible()
    page.get_by_role("button", name="Cancel").click()

    page.screenshot(path="verification/subscriptions.png")
    print("Subscriptions verified.")

    # 3. Navigate to Import Data
    print("Navigating to Import Data...")
    page.get_by_role("button", name="Import Data").click()
    page.wait_for_load_state("networkidle")

    expect(page.get_by_role("heading", name="Import Data")).to_be_visible()
    expect(page.get_by_text("Select CSV File")).to_be_visible()
    page.screenshot(path="verification/import.png")
    print("Import Data verified.")

    # 4. Navigate to Admin
    print("Navigating to Admin & Leaders...")
    page.get_by_role("button", name="Admin & Leaders").click()
    page.wait_for_load_state("networkidle")

    expect(page.get_by_role("heading", name="Super Admin Dashboard")).to_be_visible()
    page.screenshot(path="verification/admin.png")
    print("Admin verified.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard_features(page)
        finally:
            browser.close()
