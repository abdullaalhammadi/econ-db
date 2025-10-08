import Papa from 'papaparse';

export const parseCSV = (content: string): any[] => {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // Keep all values as strings
    transformHeader: (header: string) => header.trim(),
  });

  return result.data as any[];
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};