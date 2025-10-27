const fs = require('fs');
const path = require('path');

// --- Configuration ---
const jsonInputFilename = 'content-environment-export.json'; // Input JSON file name
const csvOutputFilename = 'translation_export.csv';       // Output CSV file name
const sourceLocale = 'en-US';                             // Locale to extract text from

// <<<--- ველები, რომლებიც არ უნდა მოხვდეს CSV-ში (თუნდაც localized იყოს) --->>>
// `entryName` და `key` უკვე დამატებულია აქ.
const fieldsToSkip = new Set([
  'key',             // Often used for internal identification, not translation
  'entryName',       // Usually internal name, not for front-end display/translation
  'slug',            // URL slugs are usually not translated
  'sectionId',       // HTML IDs are not translated
  'filterValue',     // Values used for filtering might not need translation
  'displayMedia',    // Enum-like values
  'imagePosition',   // Enum-like values
  'linkBehavior',    // Enum-like values
  'type',            // Usually an internal identifier
  'filterTag',       // Usually internal tag/category identifier
  'textAlign',       // Likely boolean or specific value, check if needed
  'sectionType',     // Enum-like identifier
  // --- დაამატეთ სხვა ველების ID-ები აქ ---
  // 'exampleFieldIdToSkip',
]);
// --- End Configuration ---

const jsonFilePath = path.resolve(__dirname, jsonInputFilename);
const csvFilePath = path.resolve(__dirname, csvOutputFilename);

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const strValue = String(value);
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n') || strValue.includes('\r')) {
    const escapedValue = strValue.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }
  return strValue;
}

try {
  // 1. Read and Parse JSON file
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`Error: Input JSON file not found at ${jsonFilePath}`);
  }
  const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
  const data = JSON.parse(jsonData);

  // 2. Identify Potential Fields for Translation from Content Types
  // ეს ობიექტი შეინახავს მხოლოდ იმ ველებს, რომლებიც პოტენციურად სათარგმნია (localized, text-based, not skipped)
  const potentiallyTranslatableFields = {};
  if (data.contentTypes && Array.isArray(data.contentTypes)) {
    data.contentTypes.forEach(ct => {
      const ctId = ct.sys?.id;
      if (ctId && ct.fields && Array.isArray(ct.fields)) {
        const fieldsToTranslate = new Set();
        ct.fields.forEach(field => {
          const fieldId = field.id;
          const isLocalized = field.localized === true; // **პირობა 1: ველი უნდა იყოს localized**
          const fieldType = field.type;

          // **პირობა 2, 3, 4: ველი უნდა იყოს Symbol/Text, არ უნდა იყოს fieldsToSkip-ში (სადაც entryName და key შედის)**
          if (fieldId && !fieldsToSkip.has(fieldId) && isLocalized && (fieldType === 'Symbol' || fieldType === 'Text')) {
            let skipBasedOnValidation = false;
            // დამატებითი ფილტრი: გამოვტოვოთ ველები, რომლებიც სავარაუდოდ არ არის სათარგმნი ტექსტი (მაგ. dropdown მნიშვნელობები, URL-ები)
            if (Array.isArray(field.validations)) {
              const isEnumLike = field.validations.some(v => v && v.in);
              const isUrlLike = field.validations.some(v => v && v.regexp && v.regexp.pattern && v.regexp.pattern.startsWith('^(ftp|http|https)'));
              if (isEnumLike || isUrlLike) {
                skipBasedOnValidation = true;
              }
            }
            if (!skipBasedOnValidation) {
              // თუ ყველა პირობა და პოტენციური ვალიდაციის ფილტრი დაკმაყოფილდა, ვამატებთ სათარგმნად
              fieldsToTranslate.add(fieldId);
            }
          }
          // თუ ველი არ არის localized (isLocalized === false), ის ავტომატურად იგნორირდება და არ ემატება fieldsToTranslate-ში.
        });
        if (fieldsToTranslate.size > 0) {
          potentiallyTranslatableFields[ctId] = fieldsToTranslate;
        }
      }
    });
  } else {
    console.warn("Warning: 'contentTypes' array not found or is not an array in the JSON data.");
  }

  // 3. Iterate Through Entries and Extract Actual Values for Translation
  const csvRows = [];
  csvRows.push('Key,Value_en-US'); // Header row

  if (data.entries && Array.isArray(data.entries)) {
    data.entries.forEach(entry => {
      const entryId = entry.sys?.id;
      const contentTypeId = entry.sys?.contentType?.sys?.id;

      // ვირჩევთ მხოლოდ იმ entry-ებს, რომელთა content type-ს აქვს პოტენციურად სათარგმნი ველები
      if (!entryId || !contentTypeId || !potentiallyTranslatableFields[contentTypeId]) {
        return;
      }

      const translatableFieldsForThisType = potentiallyTranslatableFields[contentTypeId];
      const entryFields = entry.fields || {};

      // ვიღებთ მნიშვნელობებს მხოლოდ იმ ველებისთვის, რომლებიც წინა ეტაპზე დავადგინეთ, რომ სათარგმნია
      translatableFieldsForThisType.forEach(fieldId => {
        // **პირობა 5: ველს უნდა ჰქონდეს მნიშვნელობა sourceLocale-ში (en-US) და ის უნდა იყოს სტრიქონი**
        if (entryFields[fieldId] && entryFields[fieldId][sourceLocale] !== undefined) {
          const value = entryFields[fieldId][sourceLocale];
          if (typeof value === 'string' && value.trim()) { // ვამოწმებთ, რომ მნიშვნელობა არის არა-ცარიელი სტრიქონი
            const key = `${entryId}_${fieldId}`;
            csvRows.push(`${escapeCsvValue(key)},${escapeCsvValue(value)}`);
          } else if (value && typeof value !== 'string'){
            console.warn(`Warning: Field '${fieldId}' for entry '${entryId}' has a non-string value in locale '${sourceLocale}'. Skipping.`);
          }
          // თუ entryFields[fieldId][sourceLocale] არ არსებობს ან ცარიელია, ის არ ემატება CSV-ში.
        }
      });
    });
  } else {
    console.warn("Warning: 'entries' array not found or is not an array in the JSON data.");
  }

  // 4. Write CSV File
  if (csvRows.length > 1) { // თუ ჰედერის გარდა სხვა მონაცემებიც არის
    const csvContent = csvRows.join('\n');
    fs.writeFileSync(csvFilePath, csvContent, 'utf-8');
    console.log(`Successfully generated CSV file: ${csvOutputFilename}`);
  } else {
    console.log(`No translatable text found in '${sourceLocale}' locale based on current filters.`);
  }

} catch (error) {
  console.error("An error occurred:", error.message);
}
