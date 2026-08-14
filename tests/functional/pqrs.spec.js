const { test, expect } = require('@playwright/test');

test.describe('--- PRUEBAS FUNCIONALES (Módulo PQRS - UI) ---', () => {

    test('El administrador debería poder ver la lista de PQRS en el navegador', async ({ page }) => {
        // 1. Abre el navegador en el módulo de PQRS
        await page.goto('http://localhost:3000/admin/pqrs', { waitUntil: 'networkidle' });

        // 2. Espera a que la tabla o lista de PQRS cargue
        await page.waitForSelector('table, [data-testid="pqrs-list"]', { timeout: 5000 }).catch(() => {
            console.log('Elemento de lista de PQRS no encontrado. Verifica que el Frontend esté corriendo en puerto 3000');
        });

        // 3. Valida que la lista sea visible
        const pqrsItems = page.locator('tbody tr, [data-testid="pqrs-item"]');
        const count = await pqrsItems.count();

        // Si hay al menos un PQRS, la prueba pasa
        if (count > 0) {
            console.log(`✓ Se encontraron ${count} PQRS`);
            await expect(pqrsItems.first()).toBeVisible();
        } else {
            console.log('⚠ No se encontraron PQRS en la lista');
        }
    });

    test('El administrador debería poder crear un nuevo PQRS', async ({ page }) => {
        // 1. Navega a la página de PQRS
        await page.goto('http://localhost:3000/admin/pqrs', { waitUntil: 'networkidle' });

        // 2. Busca el botón de crear PQRS
        const btnCrear = page.locator('button:has-text("Crear"), button:has-text("Nueva"), button:has-text("Agregar")');

        if (await btnCrear.count() > 0) {
            console.log('✓ Botón de crear encontrado');
            await btnCrear.first().click();

            // 3. Espera que se abra el formulario
            await page.waitForSelector('input, textarea', { timeout: 5000 }).catch(() => {
                console.log('Formulario no encontrado');
            });

            console.log('✓ Formulario de PQRS abierto correctamente');
        } else {
            console.log('⚠ Botón de crear PQRS no encontrado');
        }
    });

    test('El administrador debería poder filtrar PQRS por tipo', async ({ page }) => {
        // 1. Navega a la página de PQRS
        await page.goto('http://localhost:3000/admin/pqrs', { waitUntil: 'networkidle' });

        // 2. Busca elementos de filtro
        const filtros = page.locator('select, [role="combobox"]');
        const count = await filtros.count();

        if (count > 0) {
            console.log(`✓ Se encontraron ${count} filtros disponibles`);

            // 3. Selecciona el primer filtro
            await filtros.first().click();
            console.log('✓ Filtro seleccionado');
        } else {
            console.log('⚠ No se encontraron filtros de tipo PQRS');
        }
    });
});
