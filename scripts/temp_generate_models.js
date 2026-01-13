
const newColors = ['Bk', 'La', 'Mi', 'Sa', 'Wh'];
const storages = ['128GB', '256GB', '512GB'];
const countries = [
    { name: 'Китай 🇨🇳', simTypes: ['1 SIM', '2 SIM'] },
    { name: 'США 🇺🇸', simTypes: ['eSIM'] },
    { name: 'Европа 🇪🇺', simTypes: ['eSIM'] },
    { name: 'ОАЭ 🇦🇪', simTypes: ['1 SIM', '2 SIM'] },
    { name: 'Япония 🇯🇵', simTypes: ['eSIM'] }
];
const basePrices = {
    '128GB': 60000,
    '256GB': 72000,
    '512GB': 86000
};

let newEntries = [];

for (const storage of storages) {
    for (const color of newColors) {
        for (const country of countries) {
            for (const simType of country.simTypes) {
                newEntries.push({
                    model: '17',
                    variant: '',
                    storage: storage,
                    color: color,
                    country: country.name,
                    simType: simType,
                    basePrice: basePrices[storage],
                });
            }
        }
    }
}

let newEntriesString = newEntries.map(entry => `
  {
    model: '${entry.model}',
    variant: '${entry.variant}',
    storage: '${entry.storage}',
    color: '${entry.color}',
    country: '${entry.country}',
    simType: '${entry.simType}',
    basePrice: ${entry.basePrice},
  }`).join(',');

console.log(newEntriesString);
