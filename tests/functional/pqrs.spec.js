const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

test.describe('PRUEBAS FUNCIONALES - Módulo PQRS - UI', () => {

    test.beforeEach(async ({ page }) => {

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error(
                'Faltan TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD'
            );
        }

        // 1. Abrir login
        await page.goto('http://localhost:3000/login', {
            waitUntil: 'networkidle'
        });

        // 2. Verificar login
        await expect(
            page.getByText('Iniciar Sesión', { exact: false })
        ).toBeVisible({ timeout: 10000 });

        console.log('Intentando iniciar sesión con:', ADMIN_EMAIL);

        // 3. Llenar correo
        await page.getByLabel('Correo Electrónico').fill(ADMIN_EMAIL);

        // 4. Llenar contraseña
        await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD);

        // 5. Escuchar las peticiones para diagnóstico
        page.on('request', request => {
            if (
                request.method() === 'POST' &&
                request.url().includes('/usuarios/login')
            ) {
                console.log('LOGIN REQUEST:', request.url());
            }
        });

        page.on('response', response => {
            if (
                response.request().method() === 'POST' &&
                response.url().includes('/usuarios/login')
            ) {
                console.log(
                    'LOGIN RESPONSE:',
                    response.status(),
                    response.url()
                );
            }
        });

        // 6. Hacer clic en ingresar
        await page.getByRole('button', { name: 'Ingresar' }).click();

        // 7. Dar tiempo al frontend para procesar el login
        await page.waitForTimeout(3000);

        console.log('URL después del login:', page.url());

        // 8. El login no debe dejar al usuario en /login
        if (page.url().includes('/login')) {

            const bodyText = await page.locator('body').innerText();

            throw new Error(
                `El inicio de sesión no fue exitoso.\n` +
                `URL actual: ${page.url()}\n` +
                `Contenido: ${bodyText}`
            );
        }

        // 9. Ir directamente al módulo PQRS
        await page.goto('http://localhost:3000/pqrs', {
            waitUntil: 'networkidle'
        });

        // 10. Confirmar que PQRS cargó
        await expect(page).not.toHaveURL(/\/login/, {
            timeout: 10000
        });

        await expect(
            page.locator('body')
        ).toContainText('PQRS', {
            timeout: 10000
        });
    });


    test('El administrador debería poder ver la lista de PQRS en el navegador', async ({ page }) => {

        const historial = page.getByText('Historial', {
            exact: true
        });

        await expect(historial).toBeVisible({
            timeout: 10000
        });

        await historial.click();

        const tabla = page.locator('.pqrs-table');

        await expect(tabla).toBeVisible({
            timeout: 10000
        });

        const pqrsItems = page.locator(
            '.pqrs-table tbody tr.ant-table-row'
        );

        const count = await pqrsItems.count();

        console.log(`✓ Se encontraron ${count} registros de PQRS`);

        expect(count).toBeGreaterThan(0);
    });


    test('El administrador debería poder abrir el formulario de una nueva PQRS', async ({ page }) => {

        const nuevaPqrs = page.getByText('Nueva PQRS', {
            exact: true
        });

        await expect(nuevaPqrs).toBeVisible({
            timeout: 10000
        });

        await nuevaPqrs.click();

        await expect(
            page.getByText('Radicar una PQRS', {
                exact: true
            })
        ).toBeVisible({
            timeout: 5000
        });

        await expect(
            page.locator('textarea')
        ).toBeVisible({
            timeout: 5000
        });

        console.log(
            '✓ Formulario de nueva PQRS abierto correctamente'
        );
    });


    test('El administrador debería poder buscar PQRS en el historial', async ({ page }) => {

        const historial = page.getByText('Historial', {
            exact: true
        });

        await expect(historial).toBeVisible({
            timeout: 10000
        });

        await historial.click();

       const buscador = page.getByRole('main').getByRole('textbox', {
    name: 'Buscar...'
});

        await expect(buscador).toBeVisible({
            timeout: 10000
        });

        await buscador.fill('Queja');

        await page.waitForTimeout(500);

        const resultados = page.locator(
            '.pqrs-table tbody tr.ant-table-row'
        );

        const count = await resultados.count();

        console.log(
            `✓ La búsqueda encontró ${count} PQRS relacionadas con "Queja"`
        );

        expect(count).toBeGreaterThan(0);
    });

});