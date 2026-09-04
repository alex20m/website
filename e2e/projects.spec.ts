import { test, expect, type Page } from '@playwright/test';
import projects from '@/data/projects';

const projectsSection = (page: Page) => page.locator('#projects');
const card = (page: Page, title: string) => page.getByTestId(`project-card-${title}`);

test.describe('Projects section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await projectsSection(page).scrollIntoViewIfNeeded();
  });

  test('renders a card for every project', async ({ page }) => {
    await expect(projectsSection(page).getByRole('heading', { level: 5 })).toHaveCount(projects.length);
    for (const project of projects) {
      await expect(card(page, project.title)).toBeVisible();
    }
  });

  for (const project of projects) {
    test.describe(`"${project.title}" card`, () => {
      test('shows the title and description', async ({ page }) => {
        await expect(card(page, project.title).getByRole('heading', { name: project.title })).toBeVisible();
        await expect(card(page, project.title).getByText(project.description)).toBeVisible();
      });

      test('lists every technology chip', async ({ page }) => {
        for (const tech of project.technologies) {
          await expect(card(page, project.title).getByText(tech, { exact: true })).toBeVisible();
        }
      });

      if (project.link) {
        test('links to the live project in a new tab', async ({ page }) => {
          const link = card(page, project.title).getByRole('link', { name: project.linkLabel || 'Learn More' });
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', project.link!);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveAttribute('rel', /noopener/);
          await expect(link).toHaveAttribute('rel', /noreferrer/);
        });
      }

      if (project.github) {
        test('links to the GitHub repo in a new tab', async ({ page }) => {
          const link = card(page, project.title).getByRole('link', { name: 'View on GitHub' });
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', project.github!);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveAttribute('rel', /noopener/);
        });
      }

      if (project.private) {
        test('shows a "Private" badge instead of a GitHub link', async ({ page }) => {
          await expect(card(page, project.title).getByText('Private', { exact: true })).toBeVisible();
          await expect(card(page, project.title).getByRole('link', { name: 'View on GitHub' })).toHaveCount(0);
        });
      }
    });
  }
});
