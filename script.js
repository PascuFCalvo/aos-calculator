document.getElementById('calculateButton').addEventListener('click', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const attacksInput = parseInt(document.getElementById('attacks').value);
    const toHit = parseInt(document.getElementById('toHit').value);
    const toWound = parseInt(document.getElementById('toWound').value);
    const rend = parseInt(document.getElementById('rend').value);
    const save = document.getElementById('save').value ? parseInt(document.getElementById('save').value) : 0;
    const ward = document.getElementById('ward').value ? parseInt(document.getElementById('ward').value) : 0;
    const damage = parseInt(document.getElementById('damage').value);
    const damageType = document.querySelector('input[name="damageDiceType"]:checked').value;
    const autoWoundOnSix = document.getElementById('autoWoundOnSix').checked;
    const mortalWoundOnSix = document.getElementById('mortalWoundOnSix').checked;
    const doubleHitOnSix = document.getElementById('doubleHitOnSix').checked;
    const mortalOnSix = document.getElementById('mortalOnSix').checked;
    const rerollOnesHit = document.getElementById('rerollOnesHit').checked;
    const rerollHits = document.getElementById('rerollHits').checked;
    const rerollOnesWound = document.getElementById('rerollOnesWound').checked;
    const rerollWounds = document.getElementById('rerollWounds').checked;
    const simulateHundred = document.getElementById('simulateHundred').checked;
    const diceType = document.querySelector('input[name="attacksDiceType"]:checked').value;

    let attacks = 0;

    // Calcular el número de ataques en función del tipo de dado seleccionado
    if (diceType === 'd3') {
        for (let i = 0; i < attacksInput; i++) {
            attacks += Math.floor(Math.random() * 3) + 1;
        }
    } else if (diceType === 'd6') {
        for (let i = 0; i < attacksInput; i++) {
            attacks += Math.floor(Math.random() * 6) + 1;
        }
    } else {
        attacks = attacksInput;
    }

    // Inicializar acumuladores
    let totalHits = 0;
    let totalWounds = 0;
    let totalMortalWounds = 0;
    let totalUnsavedWounds = 0;
    let totalFinalDamage = 0;

    let hitRolls = [];
    let woundRolls = [];
    let saveRolls = [];
    let wardRolls = [];

    const iterations = simulateHundred ? 100 : 1;

    for (let j = 0; j < iterations; j++) {
        // Inicializar contadores y arrays para las tiradas
        let hits = 0;
        let wounds = 0;
        let mortalWounds = 0;
        let unsavedWounds = 0;
        let finalDamage = 0;

        let currentHitRolls = [];
        let currentWoundRolls = [];

        // Simular las tiradas de ataque
        for (let i = 0; i < attacks; i++) {
            let hitRoll = Math.floor(Math.random() * 6) + 1;
            currentHitRolls.push(hitRoll);
        }

        // Repetir 1s al hit
        if (rerollOnesHit) {
            let onesRerolls = currentHitRolls.filter(roll => roll === 1).length;
            for (let i = 0; i < onesRerolls; i++) {
                let reroll = Math.floor(Math.random() * 6) + 1;
                currentHitRolls.push(reroll);
            }
        }

        // Repetir hits fallidos
        if (rerollHits) {
            let failedHits = currentHitRolls.filter(roll => roll < toHit).length;
            for (let i = 0; i < failedHits; i++) {
                let reroll = Math.floor(Math.random() * 6) + 1;
                currentHitRolls.push(reroll);
            }
        }

        // Calcular impactos exitosos
        for (let roll of currentHitRolls) {
            if (!simulateHundred) hitRolls.push(roll);

            if (roll >= toHit) {
                hits++;
                if (doubleHitOnSix && roll === 6) {
                    hits++; // Impacto adicional por cada 6
                }
                if (autoWoundOnSix && roll === 6) {
                    wounds++;
                    continue;
                }

                let woundRoll = Math.floor(Math.random() * 6) + 1;
                currentWoundRolls.push(woundRoll);

                if (woundRoll === 6 && mortalOnSix) {
                    mortalWounds++;
                } else if (woundRoll >= toWound) {
                    wounds++;
                    if (mortalWoundOnSix && woundRoll === 6) {
                        mortalWounds++;
                    }
                }
            }
        }

        // Repetir 1s al wound
        if (rerollOnesWound) {
            let onesRerolls = currentWoundRolls.filter(roll => roll === 1).length;
            for (let i = 0; i < onesRerolls; i++) {
                let reroll = Math.floor(Math.random() * 6) + 1;
                currentWoundRolls.push(reroll);
            }
        }

        // Repetir wounds fallidos
        if (rerollWounds) {
            let failedWounds = currentWoundRolls.filter(roll => roll < toWound).length;
            for (let i = 0; i < failedWounds; i++) {
                let reroll = Math.floor(Math.random() * 6) + 1;
                currentWoundRolls.push(reroll);
            }
        }

        // Calcular heridas exitosas
        for (let roll of currentWoundRolls) {
            if (!simulateHundred) woundRolls.push(roll);

            if (roll >= toWound) {
                wounds++;
            }
        }

        // Ajustar la tirada de salvación por rend
        const adjustedSave = save > 0 ? save + rend : 0;

        // Simular las tiradas de salvación
        if (adjustedSave > 0) {
            for (let i = 0; i < wounds; i++) {
                const saveRoll = Math.floor(Math.random() * 6) + 1;
                if (!simulateHundred) saveRolls.push(saveRoll);

                if (saveRoll < adjustedSave) {
                    unsavedWounds++;
                }
            }
        } else {
            unsavedWounds = wounds;
        }

        // Simular las tiradas de salvaguarda
        if (ward > 0) {
            let unsavedWoundsAfterSave = unsavedWounds;
            unsavedWounds = 0;
            for (let i = 0; i < unsavedWoundsAfterSave; i++) {
                const wardRoll = Math.floor(Math.random() * 6) + 1;
                if (!simulateHundred) wardRolls.push(wardRoll);

                if (wardRoll < ward) {
                    unsavedWounds++;
                }
            }
        }

        // Calcular el daño total en función del tipo de daño
        for (let i = 0; i < unsavedWounds; i++) {
            if (damageType === 'd3') {
                finalDamage += Math.floor(Math.random() * 3) + 1;
            } else if (damageType === 'd6') {
                finalDamage += Math.floor(Math.random() * 6) + 1;
            } else {
                finalDamage += damage;
            }
        }

        // Añadir el daño mortal directo
        finalDamage += mortalWounds;

        // Acumular resultados
        totalHits += hits;
        totalWounds += wounds;
        totalMortalWounds += mortalWounds;
        totalUnsavedWounds += unsavedWounds;
        totalFinalDamage += finalDamage;
    }

    // Calcular promedios si es necesario
    if (simulateHundred) {
        totalHits /= iterations;
        totalWounds /= iterations;
        totalMortalWounds /= iterations;
        totalUnsavedWounds /= iterations;
        totalFinalDamage /= iterations;
    }

    // Mostrar el resultado
    document.getElementById('resultContainer').classList.remove('hidden');
    document.getElementById('result').textContent = `Daño Total: ${totalFinalDamage.toFixed(2)} (Daño Mortal: ${totalMortalWounds.toFixed(2)})`;

    // Mostrar las tiradas solo si no se simulan 100 tiradas
    if (!simulateHundred) {
        document.getElementById('hitRolls').textContent = `Tiradas para impactar: ${hitRolls.join(', ')}`;
        document.getElementById('woundRolls').textContent = `Tiradas para herir: ${woundRolls.join(', ')}`;
        document.getElementById('saveRolls').textContent = `Tiradas para salvar: ${saveRolls.join(', ')}`;
        document.getElementById('wardRolls').textContent = `Tiradas de salvaguarda: ${wardRolls.join(', ')}`;
    } else {
        document.getElementById('hitRolls').textContent = '';
        document.getElementById('woundRolls').textContent = '';
        document.getElementById('saveRolls').textContent = '';
        document.getElementById('wardRolls').textContent = '';
    }
});
