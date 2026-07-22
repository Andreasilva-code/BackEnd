const { test, expect } = require('@playwright/test');

test.describe('--- PRUEBAS FUNCIONALES (Módulo Propietarios - UI) ---', () => {

    test('El administrador debería poder ver la lista de propietarios en el navegador', async ({ page }) => {
        // 1. Abre el navegador en el módulo correcto
        await page.goto('http://localhost:3000/admin/propietarios');

        // 2. Simula la búsqueda por nombre en la interfaz de usuario
        await page.fill('#buscar-propietario', 'Carlos');
        await page.click('#btn-filtrar');

        // 3. Valida que el requerimiento funcional se refleje visualmente en pantalla
        const tarjetaPropietario = page.locator('.card-propietario');
        await expect(tarjetaPropietario).toBeVisible();
    });
});






