import { expect, test } from '@playwright/test'

test('counts clicks on the home page', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Increment' }).click()
  await page.getByRole('button', { name: 'Increment' }).click()
  await page.getByRole('button', { name: 'Decrement' }).click()

  await expect(page.getByRole('status')).toHaveText('Clicks: 1')
})

test('navigates to the users page and loads users from the API', async ({
  page,
}) => {
  await page.goto('/')

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Users' })
    .click()

  await expect(page).toHaveURL('/users')
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  const users = page.getByRole('list', { name: 'Users' }).getByRole('listitem')
  await expect(users.first()).toBeVisible()
  expect(await users.count()).toBeGreaterThan(0)
})

test('shows a not found page for unknown URLs', async ({ page }) => {
  await page.goto('/does-not-exist')

  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Go home' }).click()
  await expect(page).toHaveURL('/')
})
