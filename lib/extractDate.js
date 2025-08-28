function extractDate(phrase) {
    // Mapeo de nombres y abreviaturas de meses en diferentes idiomas a números de mes
    const months = {
        // Inglés
        'january': '01', 'jan': '01', 'jan.': '01',
        'february': '02', 'feb': '02', 'feb.': '02',
        'march': '03', 'mar': '03', 'mar.': '03',
        'april': '04', 'apr': '04', 'apr.': '04',
        'may': '05', 'may.': '05',
        'june': '06', 'jun': '06', 'jun.': '06',
        'july': '07', 'jul': '07', 'jul.': '07',
        'august': '08', 'aug': '08', 'aug.': '08',
        'september': '09', 'sep': '09', 'sep.': '09',
        'october': '10', 'oct': '10', 'oct.': '10',
        'november': '11', 'nov': '11', 'nov.': '11',
        'december': '12', 'dec': '12', 'dec.': '12',
        // Español
        'enero': '01', 'ene': '01', 'ene.': '01',
        'febrero': '02', 'feb': '02', 'feb.': '02',
        'marzo': '03', 'mar': '03', 'mar.': '03',
        'abril': '04', 'abr': '04', 'abr.': '04',
        'mayo': '05', 'may': '05', 'may.': '05',
        'junio': '06', 'jun': '06', 'jun.': '06',
        'julio': '07', 'jul': '07', 'jul.': '07',
        'agosto': '08', 'ago': '08', 'ago.': '08',
        'septiembre': '09', 'sep': '09', 'sep.': '09',
        'octubre': '10', 'oct': '10', 'oct.': '10',
        'noviembre': '11', 'nov': '11', 'nov.': '11',
        'diciembre': '12', 'dic': '12', 'dic.': '12',
        // Portugués
        'janeiro': '01', 'jan': '01', 'jan.': '01',
        'fevereiro': '02', 'fev': '02', 'fev.': '02',
        'março': '03', 'mar': '03', 'mar.': '03',
        'abril': '04', 'abr': '04', 'abr.': '04',
        'maio': '05', 'mai': '05', 'mai.': '05',
        'junho': '06', 'jun': '06', 'jun.': '06',
        'julho': '07', 'jul': '07', 'jul.': '07',
        'agosto': '08', 'ago': '08', 'ago.': '08',
        'setembro': '09', 'set': '09', 'set.': '09',
        'outubro': '10', 'out': '10', 'out.': '10',
        'novembro': '11', 'nov': '11', 'nov.': '11',
        'dezembro': '12', 'dez': '12', 'dez.': '12'
    };

    // Expresiones regulares para diferentes formatos de fecha
    const datePatterns = [
        // Patrón para "Veiculação iniciada em 3 de nov de 2024"
        /veiculação iniciada em (\d{1,2})(?:\s*de\s*)([a-zA-ZçÇ.]+)[,\.]?(?:\s*de\s*|,\s*)(\d{4})/,
        // Formatos como '4 nov 2024', '4 nov. 2024', '4 de nov. de 2024'
        /(\d{1,2})(?:\s*(?:de)?\s*)([a-zA-ZçÇ.]+)[,\.]?(?:\s*(?:de)?\s*)(\d{4})/,
        // Formatos como 'november 4, 2024', 'nov 4, 2024'
        /([a-zA-ZçÇ.]+)\s*(\d{1,2})(?:\w{2})?,?\s*(\d{4})/,
        // Formatos numéricos como '04/11/2024' o '11/04/2024'
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
    ];

    phrase = phrase.toLowerCase();

    for (let pattern of datePatterns) {
        const match = phrase.match(pattern);
        if (match) {
            let day, month, year;

            if (pattern === datePatterns[0]) {
                // Patrón para 'Veiculação iniciada em' seguido de una fecha
                day = match[1].padStart(2, '0');
                const monthName = match[2].replace(/[.,]/g, '');
                month = months[monthName] || '00';
                year = match[3];
            } else if (pattern === datePatterns[1]) {
                // Patrón: día mes año
                day = match[1].padStart(2, '0');
                const monthName = match[2].replace(/[.,]/g, '');
                month = months[monthName] || '00';
                year = match[3];
            } else if (pattern === datePatterns[2]) {
                // Patrón: mes día, año
                const monthName = match[1].replace(/[.,]/g, '');
                month = months[monthName] || '00';
                day = match[2].padStart(2, '0');
                year = match[3];
            } else if (pattern === datePatterns[3]) {
                // Patrón: dd/mm/aaaa o mm/dd/aaaa
                day = match[1].padStart(2, '0');
                month = match[2].padStart(2, '0');
                year = match[3];
                // Ajustar día y mes basado en el idioma
                if (/em circulação|en circulación|veiculação iniciada em/.test(phrase)) {
                    // Asumir dd/mm/aaaa
                } else if (/in circulation|started running/.test(phrase)) {
                    // Asumir mm/dd/aaaa
                    [day, month] = [month, day];
                }
            }

            if (day && month && year) {
                return `${year}-${month}-${day}`;
            }
        }
    }

    return new Date().toISOString().split('T')[0];
}

