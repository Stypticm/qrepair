const fs = require('fs');
const path = require('path');

// Читаем CSV файл
const csvPath = path.join(__dirname, 'appleModels.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Парсим CSV
const lines = csvContent.split('\n');
const headers = lines[0].split(',');
const data = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    
    return {
        model: values[0],
        variant: values[1],
        storage: values[2],
        color: values[3],
        country: values[4].replace(/"/g, ''), // Убираем кавычки
        simType: values[5],
        basePrice: parseInt(values[6])
    };
});

// Генерируем TypeScript код
const tsContent = `export interface IPhone {
  model: string
  variant: string
  storage: string
  color: string
  country: string
  simType: string
  basePrice: number // Базовая цена в рублях (средняя по РФ, -10%)
}

export const iphones: IPhone[] = [
${data.map(phone => `  {
    model: '${phone.model}',
    variant: '${phone.variant}',
    storage: '${phone.storage}',
    color: '${phone.color}',
    country: '${phone.country}',
    simType: '${phone.simType}',
    basePrice: ${phone.basePrice},
  }`).join(',\n')}
];`;

// Сохраняем обновленный файл
const outputPath = path.join(__dirname, '..', 'src', 'core', 'appleModels.ts');
fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log(`Файл appleModels.ts обновлен: ${outputPath}`);
console.log(`Всего записей: ${data.length}`);
