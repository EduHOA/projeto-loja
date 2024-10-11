function processExcel() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecione um arquivo Excel.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const processedData = processData(json);

        const newSheet = XLSX.utils.aoa_to_sheet(processedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'ProcessedData');

        const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.getElementById('downloadLink');
        link.href = url;
        link.download = 'processed_file.xlsx';
        link.style.display = 'block';
        link.innerText = 'Download Processed File';
    };

    reader.onerror = function(e) {
        console.error('Erro ao ler o arquivo:', e);
    };

    reader.readAsArrayBuffer(file);
}

function processData(data) {
    const headers = data[0]; // Cabeçalhos na primeira linha

    if (!headers) {
        console.error('Cabeçalhos não encontrados no arquivo!');
        return [];
    }

    // Índices das colunas relevantes
    const titleIndex = headers.indexOf('Detalhes do produto');
    const statusIndex = headers.indexOf('Tipo de transação');
    const revenueIndex = headers.indexOf('Custo total do produto');
    const totalIndex = headers.indexOf('(total) (BRL)');

    if (titleIndex === -1 || statusIndex === -1 || revenueIndex === -1 || totalIndex === -1) {
        console.error('Alguma coluna não foi encontrada no arquivo.');
        return [];
    }

    const filteredData = [];
    filteredData.push(['Título do anúncio', 'Status', 'Receita por produtos (BRL)', 'Total (BRL)']);

    // Processa os dados a partir da segunda linha (dados da tabela)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        const status = row[statusIndex]?.toLowerCase();
        // Verifica se a linha deve ser excluída com base no status
        if (status && (
            status.includes('saldo do extrato anterior indisponível') ||
            status.includes('saldo indisponível') ||
            status.includes('Acúmulo')
        )) {
            continue; // Pula as linhas que correspondem aos status indesejados
        }

        // Adiciona a linha filtrada com as colunas relevantes
        filteredData.push([
            row[titleIndex],
            row[statusIndex],
            row[revenueIndex],
            row[totalIndex]
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