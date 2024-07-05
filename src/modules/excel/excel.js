const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

class Excel {

    async getData(fileName) {
        const filePath = path.join(__dirname, '../../../../uploads/excel/', fileName);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames;
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName[0]]);
        

        return data;
    }

    #excelDateToJSDate = (serial) => {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
    
        const fractional_day = serial - Math.floor(serial) + 0.0000001;
    
        let total_seconds = Math.floor(86400 * fractional_day);
    
        const seconds = total_seconds % 60;
    
        total_seconds -= seconds;
    
        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;
    
        return new Date(Date.UTC(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds));
    }

    attendenceData = (jsonData) => {
        return jsonData.map(entry => {
            const dateObj = this.#excelDateToJSDate(entry.TIME);
            return {
                WORKER_ID: entry.WORKER_ID,
                DATE: dateObj.toISOString().split('T')[0], 
                TIME: dateObj.toISOString().split('T')[1].split('.')[0] 
            };
        })
    }
}

module.exports = Excel;
