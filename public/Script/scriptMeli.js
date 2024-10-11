function processExcel() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Obtém a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Converte a planilha em JSON
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Filtra e processa os dados de acordo com as regras solicitadas
        const processedData = processData(json);

        // Cria um novo arquivo Excel com os dados processados
        const newSheet = XLSX.utils.aoa_to_sheet(processedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'ProcessedData');

        // Gera o arquivo para download
        const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.getElementById('downloadLink');
        link.href = url;
        link.download = 'processed_file.xlsx';
        link.style.display = 'block';
        link.innerText = 'Download Processed File';
    };

    reader.readAsArrayBuffer(file);
}

function processData(data) {
    // Os dados começam a partir da linha 6 (índice 5)
    const filteredData = [];
    const headers = data[5];

    // Índices das colunas relevantes
    const titleIndex = headers.indexOf('Título do anúncio');
    const statusIndex = headers.indexOf('Status');
    const unitsIndex = headers.indexOf('Unidades');
    const revenueIndex = headers.indexOf('Receita por produtos (BRL)');
    const shippingIndex = headers.indexOf('Tarifas de envio');
    const totalIndex = headers.indexOf('Total (BRL)'); // Novo índice para a coluna "Total (BRL)"

    // Adiciona o cabeçalho ao resultado
    filteredData.push(['Título do anúncio', 'Status', 'Unidades', 'Receita por produtos (BRL)', 'Tarifas de envio', 'Total (BRL)', 'Tarifas de envio (se Receita >= 79)']);

    // Processa as linhas de dados
    for (let i = 6; i < data.length; i++) {
        const row = data[i];

        // Ignora linhas com status indesejados
        const status = row[statusIndex]?.toLowerCase();
        if (status && (status.includes('cancelada pelo comprador') ||
                       status.includes('Mediação finalizada com reembolso para o comprador')||
                       status.includes('devolução a caminho') ||
                       status.includes('venda cancelada') ||
                       status.includes('devolução finalizada com reembolso para o comprador') ||
                       status.includes('pacote cancelado pelo mercado livre') ||
                       status.includes('não envie.'))) {
            continue;
        }

        // Verifica se a Receita por produtos (BRL) é maior ou igual a 79
        const receita = parseFloat(row[revenueIndex]) || 0;
        const tarifasEnvio = receita >= 79 ? row[shippingIndex] : '';

        // Adiciona a linha filtrada com as colunas relevantes, incluindo "Total (BRL)"
        filteredData.push([
            row[titleIndex],
            row[statusIndex],
            row[unitsIndex],
            row[revenueIndex],
            row[shippingIndex],
            row[totalIndex], // Incluindo "Total (BRL)"
            tarifasEnvio
        ]);
    }

    return filteredData;
}

function showFileName() {
    const fileInput = document.getElementById('upload');
    const fileLabel = document.getElementById('fileLabel');
    const uploadMessage = document.getElementById('uploadMessage');

    if (fileInput.files.length > 0) {
        fileLabel.textContent = fileInput.files[0].name;
        uploadMessage.style.display = 'block';
    }
}