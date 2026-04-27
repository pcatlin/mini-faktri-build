import { expect, test } from "@playwright/test";

test("renders builder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Mini FAKTRI Deployment Builder")).toBeVisible();
  await expect(page.getByTestId("builder-canvas")).toBeVisible();
});

test("shows validation errors for invalid deployment", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("validate-btn").click();
  // UI may be empty-errors on blank config; force known invalid path.
  await page.evaluate(() => {
    const event = new DragEvent("drop", {
      dataTransfer: new DataTransfer(),
      bubbles: true,
      cancelable: true,
    });
    event.dataTransfer?.setData(
      "application/x-faktri",
      JSON.stringify({ kind: "service", value: "drone_control_center", label: "Drone Control Center" }),
    );
    document.querySelector("[data-testid='builder-canvas']")?.dispatchEvent(event);
  });
  await page.getByTestId("validate-btn").click();
  await expect(page.getByTestId("error-list")).toContainText("requires db");
});

test("generates yaml for valid deployment", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const drop = (payload: object) => {
      const event = new DragEvent("drop", {
        dataTransfer: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      });
      event.dataTransfer?.setData("application/x-faktri", JSON.stringify(payload));
      document.querySelector("[data-testid='builder-canvas']")?.dispatchEvent(event);
    };
    drop({ kind: "resource", value: "cpu" });
    drop({ kind: "service", value: "db", label: "DB" });
    drop({ kind: "service", value: "drone_control_center", label: "Drone Control Center" });
  });
  await page.getByTestId("generate-yaml-btn").click();
  await expect(page.getByTestId("yaml-output")).toContainText("name:");
});

test("saves draft and displays saved system", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("save-draft-btn").click();
  await expect(page.getByTestId("saved-list")).toContainText("draft");
});
