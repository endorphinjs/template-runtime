import fs from 'fs';
import path from 'path';

export default function readFile(file) {
	return fs.readFileSync(path.resolve(__dirname, '../', file), 'utf8').trim();
}
