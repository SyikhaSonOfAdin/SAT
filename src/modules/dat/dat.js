const fs = require('fs');
const path = require('path');

class Dat {

    async getData(fileName) {
        const filePath = path.join(__dirname, '../../../../uploads/dat/', fileName);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
        
            // Mengubah data menjadi objek
            const lines = data.trim().split('\n').filter(line => line.trim() !== '');
            const result = lines.map(line => {
                const parts = line.trim().split(/\s+/);
                return {
                    WORKER_ID: parts[0],
                    DATE: parts[1],
                    TIME: parts[2]
                };
            });
            return result;
        } catch (err) {
            console.error('Error membaca file secara sinkron:', err);
        }
    }   
}

module.exports = Dat;
