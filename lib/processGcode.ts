export type G54ScanResult = {
  found: boolean;
  count: number;
  lines: number[];
};

export function scanForG54(content: string): G54ScanResult {
  const splitLines = content.split(/\r?\n/);
  const matchingLines: number[] = [];

  splitLines.forEach((line, index) => {
    if (/\bG54\b/i.test(line)) {
      matchingLines.push(index + 1);
    }
  });

  return {
    found: matchingLines.length > 0,
    count: matchingLines.length,
    lines: matchingLines,
  };
}

export function deleteG254G255(content: string): string {
  return content
    .split(/\r?\n/)
    .filter((line) => !/\bG25[45]\b/i.test(line))
    .join("\n");
}

export function preCallNextTool(content: string): string {
  const lines = content.split(/\r?\n/);

  const toolChangeIndexes: number[] = [];
  const toolNumbers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*T(\d+)\s*M0?6\b/i);
    if (match) {
      toolChangeIndexes.push(i);
      toolNumbers.push(match[1]);
    }
  }

  if (toolChangeIndexes.length < 2) {
    return content;
  }

  let offset = 0;

  for (let i = 0; i < toolChangeIndexes.length - 1; i++) {
    const insertAt = toolChangeIndexes[i] + 2 + offset;
    const nextToolNumber = toolNumbers[i + 1];

    lines.splice(insertAt, 0, `T${nextToolNumber}`);
    offset++;
  }

  return lines.join("\n");



  
}

export function preCallNextToolV2(content: string): string {
  const lines = content.split(/\r?\n/);

  const toolChangeIndexes: number[] = [];
  const toolNumbers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*(?:N\d+\s*)?T(\d+)\s*M0?6\b/i);

    if (match) {
      toolChangeIndexes.push(i);
      toolNumbers.push(match[1]);
    }
  }

  if (toolChangeIndexes.length < 1) {
    return content;
  }

  let offset = 0;

  for (let i = 0; i < toolChangeIndexes.length; i++) {
    const insertAt = toolChangeIndexes[i] + 2 + offset;

    const nextToolNumber =
      i === toolNumbers.length - 1
        ? toolNumbers[0]
        : toolNumbers[i + 1];

    lines.splice(insertAt, 0, `T${nextToolNumber}`);
    offset++;
  }

  return lines.join("\n");
}